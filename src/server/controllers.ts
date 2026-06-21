import { Response } from "express";
import { AuthenticatedRequest } from "./auth";
import prisma from "./db";

// ==========================================
// CLIENT CONTROLLERS
// ==========================================

export async function getClientProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user?.id },
      include: { coach: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
}

export async function upsertClientProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const { age, gender, weight, height, goal, activityLevel, dietType } = req.body;
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user?.id },
      update: {
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        goal,
        activityLevel,
        dietType,
      },
      create: {
        userId: req.user!.id,
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        goal,
        activityLevel,
        dietType,
      },
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to save profile." });
  }
}

export async function getClientPlans(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    // Get latest DietPlan (could be COACH or AI, prioritize COACH)
    const dietPlans = await prisma.dietPlan.findMany({
      where: { clientId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    const coachDiet = dietPlans.find(p => p.type === "COACH");
    const aiDiet = dietPlans.find(p => p.type === "AI");
    const dietPlan = coachDiet || aiDiet || null;

    // Parse JSON string fields back to objects
    let parsedDiet = null;
    if (dietPlan) {
      parsedDiet = {
        ...dietPlan,
        meals: JSON.parse(dietPlan.meals),
        groceryList: JSON.parse(dietPlan.groceryList),
      };
    }

    // Get latest WorkoutPlan
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { clientId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    let parsedWorkout = null;
    if (workoutPlan) {
      parsedWorkout = {
        ...workoutPlan,
        days: JSON.parse(workoutPlan.days),
      };
    }

    res.json({
      dietPlan: parsedDiet,
      workoutPlan: parsedWorkout,
    });
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    res.status(500).json({ error: "Failed to fetch plans." });
  }
}

export async function getClientCheckIns(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { clientId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch check-ins." });
  }
}

export async function submitCheckIn(req: AuthenticatedRequest, res: Response) {
  try {
    const { weight, energyLevel, sleepQuality, notes } = req.body;
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        clientId: profile.id,
        weight: Number(weight),
        energyLevel,
        sleepQuality,
        notes,
      },
    });

    // Update weight in main profile
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { weight: Number(weight) },
    });

    res.status(201).json(checkIn);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit check-in." });
  }
}

// ==========================================
// COACH CONTROLLERS
// ==========================================

export async function getCoachClients(req: AuthenticatedRequest, res: Response) {
  try {
    const coach = await prisma.coachProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!coach) {
      return res.status(404).json({ error: "Coach profile not found." });
    }

    const clients = await prisma.userProfile.findMany({
      where: { coachId: coach.id },
      include: {
        user: { select: { name: true, email: true } },
        checkIns: { orderBy: { createdAt: "desc" }, take: 10 },
        dietPlans: { orderBy: { createdAt: "desc" } },
        workoutPlans: { orderBy: { createdAt: "desc" } },
      },
    });

    // Parse serialized data before returning
    const parsedClients = clients.map((client) => {
      const dietPlans = client.dietPlans.map((dp) => ({
        ...dp,
        meals: JSON.parse(dp.meals),
        groceryList: JSON.parse(dp.groceryList),
      }));
      const workoutPlans = client.workoutPlans.map((wp) => ({
        ...wp,
        days: JSON.parse(wp.days),
      }));

      // Weight changes trend
      let trend = "0.0 kg";
      if (client.checkIns.length >= 2) {
        const diff = client.checkIns[0].weight - client.checkIns[1].weight;
        trend = (diff >= 0 ? "+" : "") + diff.toFixed(1) + " kg";
      }

      return {
        id: client.id,
        userId: client.userId,
        name: client.user.name,
        email: client.user.email,
        age: client.age,
        gender: client.gender,
        weight: client.weight,
        height: client.height,
        goal: client.goal,
        activityLevel: client.activityLevel,
        dietType: client.dietType,
        checkIns: client.checkIns,
        dietPlans,
        workoutPlans,
        trend,
      };
    });

    res.json(parsedClients);
  } catch (err) {
    console.error("Failed to fetch coach clients:", err);
    res.status(500).json({ error: "Failed to fetch clients." });
  }
}

export async function publishDietPlan(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId, calories, protein, carbs, fat, meals, groceryList } = req.body;

    const coach = await prisma.coachProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!coach) {
      return res.status(404).json({ error: "Coach not found." });
    }

    const dietPlan = await prisma.dietPlan.create({
      data: {
        clientId,
        coachId: coach.id,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        meals: JSON.stringify(meals),
        groceryList: JSON.stringify(groceryList),
        type: "COACH",
      },
    });

    res.status(201).json({
      ...dietPlan,
      meals,
      groceryList,
    });
  } catch (err) {
    console.error("Publish diet plan error:", err);
    res.status(500).json({ error: "Failed to publish diet plan." });
  }
}

export async function publishWorkoutPlan(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId, splitName, days } = req.body;

    const coach = await prisma.coachProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!coach) {
      return res.status(404).json({ error: "Coach not found." });
    }

    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        clientId,
        coachId: coach.id,
        splitName,
        days: JSON.stringify(days),
      },
    });

    res.status(201).json({
      ...workoutPlan,
      days,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to publish workout plan." });
  }
}

export async function getCoachProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const coach = await prisma.coachProfile.findUnique({
      where: { userId: req.user?.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(coach);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coach profile." });
  }
}

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export async function getAdminStats(req: AuthenticatedRequest, res: Response) {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "CLIENT" } });
    const totalCoaches = await prisma.user.count({ where: { role: "COACH" } });

    // Mock/Standard Admin statistical configuration
    const activeClients = await prisma.userProfile.count();
    const activeCoachesCount = await prisma.coachProfile.count({ where: { status: "APPROVED" } });

    // Sum commission earnings (mock calculation for demo, based on active coaches and clients)
    const baseRevenue = 124500;
    
    const stats = {
      totalRevenue: baseRevenue,
      activeClients: activeClients || totalUsers,
      subscriptions: Math.round(totalUsers * 0.4) || 28,
      coachesCount: totalCoaches,
      activeCoaches: activeCoachesCount,
      revenueTrend: [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 6000 },
        { name: 'Mar', revenue: 12000 },
        { name: 'Apr', revenue: 27800 },
        { name: 'May', revenue: 58900 },
        { name: 'Jun', revenue: 93900 },
        { name: 'Jul', revenue: baseRevenue },
      ]
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin stats." });
  }
}

export async function getAdminClients(req: AuthenticatedRequest, res: Response) {
  try {
    const clients = await prisma.userProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        coach: { include: { user: { select: { name: true } } } },
      },
    });

    const formatted = clients.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
      goal: c.goal,
      plan: c.weight > 0 ? "Premium Coaching" : "Free Tier",
      coach: c.coach ? c.coach.user.name : "Unassigned",
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve clients." });
  }
}

export async function assignCoach(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId, coachId } = req.body;
    const updated = await prisma.userProfile.update({
      where: { id: clientId },
      data: { coachId: coachId || null },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign coach." });
  }
}

export async function getAdminCoaches(req: AuthenticatedRequest, res: Response) {
  try {
    const coaches = await prisma.coachProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        clients: true,
      },
    });

    const pending = coaches.filter(c => c.status === "PENDING").map(c => ({
      id: c.id,
      name: c.user.name,
      experience: c.experience,
      certification: c.certification,
    }));

    const active = coaches.filter(c => c.status === "APPROVED").map(c => ({
      id: c.id,
      name: c.user.name,
      clients: c.clients.length,
      comm: c.commissionRate,
    }));

    res.json({ pending, active });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve coaches." });
  }
}

export async function approveCoach(req: AuthenticatedRequest, res: Response) {
  try {
    const { coachId, status } = req.body; // status: "APPROVED" or "REJECTED"
    const updated = await prisma.coachProfile.update({
      where: { id: coachId },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update coach status." });
  }
}

export async function updateCommission(req: AuthenticatedRequest, res: Response) {
  try {
    const { coachId, commissionRate } = req.body;
    const updated = await prisma.coachProfile.update({
      where: { id: coachId },
      data: { commissionRate: Number(commissionRate) },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update commission rate." });
  }
}

// ==========================================
// TRANSFORMATIONS
// ==========================================

export async function getTransformations(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await prisma.transformation.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve transformations." });
  }
}

export async function createTransformation(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, beforePhotoUrl, afterPhotoUrl, useInAds } = req.body;
    const newItem = await prisma.transformation.create({
      data: {
        title,
        description,
        beforePhotoUrl,
        afterPhotoUrl,
        useInAds: Boolean(useInAds),
      },
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save transformation." });
  }
}

export async function toggleTransformationAd(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, useInAds } = req.body;
    const updated = await prisma.transformation.update({
      where: { id },
      data: { useInAds: Boolean(useInAds) },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle transformation status." });
  }
}

// ==========================================
// CHAT MESSAGES
// ==========================================

export async function getChatMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const { otherUserId } = req.query;
    const currentUserId = req.user?.id;

    if (!otherUserId || !currentUserId) {
      return res.status(400).json({ error: "Sender and receiver IDs are required." });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: String(otherUserId) },
          { senderId: String(otherUserId), receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: String(otherUserId),
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chat history." });
  }
}

export async function sendChatMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user?.id;

    if (!receiverId || !content || !senderId) {
      return res.status(400).json({ error: "Receiver ID and message content are required." });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    // Trigger real-time alert (e.g. notify WebSocket clients)
    notifyChatClients(senderId, receiverId, message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message." });
  }
}

// Simple WebSocket notifier hook
import { wsClients } from "../server";

function notifyChatClients(senderId: string, receiverId: string, message: any) {
  const notifyList = [senderId, receiverId];
  notifyList.forEach(userId => {
    const sockets = wsClients.get(userId);
    if (sockets) {
      sockets.forEach(ws => {
        if (ws.readyState === 1 /* OPEN */) {
          ws.send(JSON.stringify({ type: "NEW_MESSAGE", payload: message }));
        }
      });
    }
  });
}
