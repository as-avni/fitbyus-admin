import { Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { AuthenticatedRequest } from "./auth";
import prisma from "./db";

// Make sure GEMINI_API_KEY is loaded from env
const apiKey = process.env.GEMINI_API_KEY || "";

export async function generateAIDietPlan(req: AuthenticatedRequest, res: Response) {
  try {
    const { age, gender, weight, height, goal, activityLevel, dietType } = req.body;

    if (!age || !gender || !weight || !height || !goal || !activityLevel || !dietType) {
      return res.status(400).json({ error: "Missing required profile fields." });
    }

    if (!req.user || req.user.role !== "CLIENT") {
      return res.status(403).json({ error: "Only clients can generate AI diet plans." });
    }

    // Retrieve client profile
    const clientProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!clientProfile) {
      return res.status(404).json({ error: "Client profile not found." });
    }

    // Update user profile with latest physical stats
    await prisma.userProfile.update({
      where: { id: clientProfile.id },
      data: {
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        goal,
        activityLevel,
        dietType,
      },
    });

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in backend env. Falling back to mock generator.");
      // Fallback Mock generator if key is not configured yet
      const mockCals = goal === "Fat Loss" ? 1800 : goal === "Muscle Gain" ? 2800 : 2200;
      const mockDiet = {
        calories: mockCals,
        macros: {
          protein: Math.round(Number(weight) * 2),
          carbs: Math.round(mockCals * 0.4 / 4),
          fat: Math.round(mockCals * 0.25 / 9),
        },
        meals: [
          { name: "Breakfast", description: `High protein ${dietType} meal with eggs/tofu, oats, and nuts`, calories: Math.round(mockCals * 0.25) },
          { name: "Lunch", description: `Balanced ${dietType} lunch with chicken breast/paneer, brown rice, and greens`, calories: Math.round(mockCals * 0.35) },
          { name: "Snack", description: "Whey protein shake with fruit", calories: Math.round(mockCals * 0.15) },
          { name: "Dinner", description: `Light ${dietType} dinner with fish/lentils, avocado, and broccoli`, calories: Math.round(mockCals * 0.25) },
        ],
        groceryList: ["Eggs/Tofu", "Oats", "Nuts", "Chicken/Paneer", "Brown Rice", "Whey Protein", "Fish/Lentils", "Avocado", "Broccoli"],
      };

      // Store in DB
      const newPlan = await prisma.dietPlan.create({
        data: {
          clientId: clientProfile.id,
          calories: mockDiet.calories,
          protein: mockDiet.macros.protein,
          carbs: mockDiet.macros.carbs,
          fat: mockDiet.macros.fat,
          meals: JSON.stringify(mockDiet.meals),
          groceryList: JSON.stringify(mockDiet.groceryList),
          type: "AI",
        },
      });

      return res.status(201).json({
        ...mockDiet,
        id: newPlan.id,
        createdAt: newPlan.createdAt,
      });
    }

    // Call Gemini API on backend
    const ai = new GoogleGenAI({ apiKey });
    
    // Using a valid standard Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a personalized ${dietType} diet plan for a ${age} year old ${gender}, weighing ${weight}kg, ${height}cm tall, with a goal of ${goal} and activity level ${activityLevel}. Provide realistic daily calories, macros in grams, a daily meal plan, and a grocery list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["protein", "carbs", "fat"]
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  calories: { type: Type.NUMBER }
                },
                required: ["name", "description", "calories"]
              }
            },
            groceryList: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["calories", "macros", "meals", "groceryList"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const dietData = JSON.parse(text);

    // Save generated diet plan to DB
    const newPlan = await prisma.dietPlan.create({
      data: {
        clientId: clientProfile.id,
        calories: Number(dietData.calories),
        protein: Number(dietData.macros.protein),
        carbs: Number(dietData.macros.carbs),
        fat: Number(dietData.macros.fat),
        meals: JSON.stringify(dietData.meals),
        groceryList: JSON.stringify(dietData.groceryList),
        type: "AI",
      },
    });

    res.status(201).json({
      ...dietData,
      id: newPlan.id,
      createdAt: newPlan.createdAt,
    });
  } catch (err: any) {
    console.error("Failed to generate AI diet plan:", err);
    res.status(500).json({ error: "Failed to generate AI diet plan: " + err.message });
  }
}
