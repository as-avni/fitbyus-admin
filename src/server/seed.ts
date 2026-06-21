import bcrypt from "bcryptjs";
import prisma from "./db";

async function main() {
  console.log("Starting database seeding...");

  // Clean old data
  await prisma.transformation.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  await prisma.dietPlan.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.coachProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@fitbyus.com",
      passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("Created Admin:", admin.email);

  // 2. Create Active Coach (Alex)
  const coachAlex = await prisma.user.create({
    data: {
      email: "coach@fitbyus.com",
      passwordHash,
      name: "Alex",
      role: "COACH",
      coachProfile: {
        create: {
          experience: "5 years",
          certification: "ACE Certified",
          commissionRate: 30.0,
          status: "APPROVED",
        },
      },
    },
    include: { coachProfile: true },
  });
  console.log("Created Approved Coach Alex:", coachAlex.email);

  // 3. Create Pending Coach (Vikram Singh)
  const coachVikram = await prisma.user.create({
    data: {
      email: "coach_pending@fitbyus.com",
      passwordHash,
      name: "Vikram Singh",
      role: "COACH",
      coachProfile: {
        create: {
          experience: "4 years",
          certification: "ISSA Certified",
          commissionRate: 25.0,
          status: "PENDING",
        },
      },
    },
  });
  console.log("Created Pending Coach Vikram:", coachVikram.email);

  // 4. Create Active Client 1 (Rahul Sharma) assigned to Coach Alex
  const clientRahul = await prisma.user.create({
    data: {
      email: "client@fitbyus.com",
      passwordHash,
      name: "Rahul Sharma",
      role: "CLIENT",
      clientProfile: {
        create: {
          age: 28,
          gender: "Male",
          weight: 82.1,
          height: 180,
          goal: "Fat Loss",
          activityLevel: "Moderate",
          dietType: "Non-veg",
          coachId: coachAlex.coachProfile!.id,
        },
      },
    },
    include: { clientProfile: true },
  });
  console.log("Created Client Rahul Sharma:", clientRahul.email);

  // 5. Create Active Client 2 (Neha Singh) assigned to Coach Alex
  const clientNeha = await prisma.user.create({
    data: {
      email: "neha@fitbyus.com",
      passwordHash,
      name: "Neha Singh",
      role: "CLIENT",
      clientProfile: {
        create: {
          age: 25,
          gender: "Female",
          weight: 64.2,
          height: 163,
          goal: "Fat Loss",
          activityLevel: "Lightly Active",
          dietType: "Vegetarian",
          coachId: coachAlex.coachProfile!.id,
        },
      },
    },
    include: { clientProfile: true },
  });
  console.log("Created Client Neha Singh:", clientNeha.email);

  // 6. Create Active Client 3 (Arjun Patel) assigned to Coach Alex
  const clientArjun = await prisma.user.create({
    data: {
      email: "arjun@fitbyus.com",
      passwordHash,
      name: "Arjun Patel",
      role: "CLIENT",
      clientProfile: {
        create: {
          age: 31,
          gender: "Male",
          weight: 76.5,
          height: 175,
          goal: "Muscle Gain",
          activityLevel: "Very Active",
          dietType: "Non-veg",
          coachId: coachAlex.coachProfile!.id,
        },
      },
    },
    include: { clientProfile: true },
  });
  console.log("Created Client Arjun Patel:", clientArjun.email);

  // 7. Create Unassigned Client (Priya Patel)
  const clientPriya = await prisma.user.create({
    data: {
      email: "client_unassigned@fitbyus.com",
      passwordHash,
      name: "Priya Patel",
      role: "CLIENT",
      clientProfile: {
        create: {
          age: 26,
          gender: "Female",
          weight: 68.0,
          height: 165,
          goal: "Muscle Gain",
          activityLevel: "Lightly Active",
          dietType: "Vegetarian",
        },
      },
    },
  });
  console.log("Created Unassigned Client Priya Patel:", clientPriya.email);

  // 8. Create Check-ins for Rahul
  await prisma.checkIn.createMany({
    data: [
      {
        clientId: clientRahul.clientProfile!.id,
        weight: 82.9,
        energyLevel: "Good",
        sleepQuality: "Poor",
        notes: "Struggled with sleep on Thursday, overall energy was fine.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        clientId: clientRahul.clientProfile!.id,
        weight: 82.1,
        energyLevel: "Excellent",
        sleepQuality: "Good",
        notes: "Had a great week, solid workouts. Adhered to the diet plan.",
        createdAt: new Date(), // Today
      },
    ],
  });

  // 9. Create Check-ins for Neha
  await prisma.checkIn.createMany({
    data: [
      {
        clientId: clientNeha.clientProfile!.id,
        weight: 65.0,
        energyLevel: "Fair",
        sleepQuality: "Average",
        notes: "Missed cardio on Tuesday due to working overtime.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: clientNeha.clientProfile!.id,
        weight: 64.2,
        energyLevel: "Good",
        sleepQuality: "Excellent",
        notes: "Diet adherence was spot on. Cravings are gone.",
        createdAt: new Date(),
      },
    ],
  });

  // 10. Create Check-ins for Arjun
  await prisma.checkIn.createMany({
    data: [
      {
        clientId: clientArjun.clientProfile!.id,
        weight: 75.8,
        energyLevel: "High",
        sleepQuality: "Good",
        notes: "Gaining weight slowly as planned.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: clientArjun.clientProfile!.id,
        weight: 76.5,
        energyLevel: "Very High",
        sleepQuality: "Excellent",
        notes: "Hit bench press PR! Loving the extra carb meals.",
        createdAt: new Date(),
      },
    ],
  });
  console.log("Check-ins seeded for all three clients.");

  // 11. Create custom Diet & Workout plan for Rahul
  const mealsRahul = [
    { name: "Breakfast", description: "Oats (50g), Whey Protein (1 scoop), Almonds (15g)", calories: 420 },
    { name: "Lunch", description: "Chicken Breast (150g), White Rice (100g), Broccoli", calories: 550 },
    { name: "Pre-workout Snack", description: "Banana (1 medium), Rice Cakes (2)", calories: 180 },
  ];
  await prisma.dietPlan.create({
    data: {
      clientId: clientRahul.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      calories: 2200,
      protein: 160,
      carbs: 220,
      fat: 70,
      meals: JSON.stringify(mealsRahul),
      groceryList: JSON.stringify(["Chicken Breast", "Oats", "Whey", "Almonds", "Rice", "Broccoli"]),
      type: "COACH",
    },
  });

  // 12. Create custom Diet plan for Neha
  const mealsNeha = [
    { name: "Breakfast", description: "Greek Yogurt (200g), Berries, Chia Seeds", calories: 250 },
    { name: "Lunch", description: "Paneer Stir Fry (150g), Quinoa (80g), Peppers", calories: 480 },
    { name: "Dinner", description: "Lentil Soup (1 bowl), Tofu (100g), Avocado Salad", calories: 450 },
  ];
  await prisma.dietPlan.create({
    data: {
      clientId: clientNeha.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      calories: 1600,
      protein: 100,
      carbs: 150,
      fat: 55,
      meals: JSON.stringify(mealsNeha),
      groceryList: JSON.stringify(["Greek Yogurt", "Berries", "Paneer", "Quinoa", "Lentils", "Tofu", "Avocado"]),
      type: "COACH",
    },
  });

  // 13. Create custom Diet plan for Arjun
  const mealsArjun = [
    { name: "Breakfast", description: "4 Whole Eggs, Whole Wheat Toast, Peanut Butter", calories: 600 },
    { name: "Lunch", description: "Salmon (180g), Sweet Potatoes (200g), Asparagus", calories: 750 },
    { name: "Post-workout", description: "Gainer Shake: Oats, Whey, Banana, Milk", calories: 650 },
    { name: "Dinner", description: "Lean Beef (150g), Brown Rice, Zucchini", calories: 580 },
  ];
  await prisma.dietPlan.create({
    data: {
      clientId: clientArjun.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      calories: 3000,
      protein: 200,
      carbs: 350,
      fat: 90,
      meals: JSON.stringify(mealsArjun),
      groceryList: JSON.stringify(["Eggs", "Toast", "Peanut Butter", "Salmon", "Sweet Potatoes", "Beef", "Brown Rice"]),
      type: "COACH",
    },
  });

  // 14. Create Workout splits for all three
  const daysRahul = [
    {
      name: "Day 1: Push (Chest, Shoulders, Triceps)",
      exercises: [
        { name: "Barbell Bench Press", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Lateral Raises", sets: "4", reps: "15", rest: "45s" },
      ]
    }
  ];
  await prisma.workoutPlan.create({
    data: {
      clientId: clientRahul.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      splitName: "Push-Pull-Legs",
      days: JSON.stringify(daysRahul),
    },
  });

  const daysNeha = [
    {
      name: "Day 1: Full Body HIIT",
      exercises: [
        { name: "Goblet Squats", sets: "4", reps: "12", rest: "45s" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", rest: "45s" },
        { name: "Mountain Climbers", sets: "3", reps: "30s", rest: "30s" },
      ]
    }
  ];
  await prisma.workoutPlan.create({
    data: {
      clientId: clientNeha.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      splitName: "HIIT Conditioning",
      days: JSON.stringify(daysNeha),
    },
  });

  const daysArjun = [
    {
      name: "Day 1: Upper Body Power",
      exercises: [
        { name: "Weighted Pull Ups", sets: "4", reps: "6-8", rest: "120s" },
        { name: "Overhead Barbell Press", sets: "4", reps: "5", rest: "120s" },
        { name: "Incline Chest Flys", sets: "3", reps: "10", rest: "90s" },
      ]
    }
  ];
  await prisma.workoutPlan.create({
    data: {
      clientId: clientArjun.clientProfile!.id,
      coachId: coachAlex.coachProfile!.id,
      splitName: "Strength Hypertrophy",
      days: JSON.stringify(daysArjun),
    },
  });

  // 15. Create chat history
  await prisma.message.createMany({
    data: [
      {
        senderId: clientRahul.id,
        receiverId: coachAlex.id,
        content: "Awesome, thanks Alex! The workouts have been feeling great too.",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        senderId: coachAlex.id,
        receiverId: clientRahul.id,
        content: "Hey Rahul! I reviewed your check-in. Great progress on the weight loss! Let's bump up your carbs slightly on training days. I've updated your diet plan.",
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        senderId: clientNeha.id,
        receiverId: coachAlex.id,
        content: "Hi coach, I completed my check-in! Let me know if I should change anything.",
        createdAt: new Date(Date.now() - 4000000),
      },
      {
        senderId: coachAlex.id,
        receiverId: clientNeha.id,
        content: "Awesome work Neha. The consistency is paying off. Keep the calories at 1600.",
        createdAt: new Date(Date.now() - 2000000),
      },
      {
        senderId: clientArjun.id,
        receiverId: coachAlex.id,
        content: "Hey Alex! Hit a new bench PR today, 100kg for 5 reps!",
        createdAt: new Date(Date.now() - 5000000),
      },
      {
        senderId: coachAlex.id,
        receiverId: clientArjun.id,
        content: "Wow Arjun! Massive lifting. The strength is coming up nicely. Make sure to log your meals.",
        createdAt: new Date(Date.now() - 2500000),
      },
    ],
  });

  // 16. Transformations
  await prisma.transformation.createMany({
    data: [
      {
        title: "Client Transformation 1",
        description: "12 Week Program • -15kg",
        beforePhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
        afterPhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
        useInAds: true,
      },
      {
        title: "Client Transformation 2",
        description: "16 Week Program • Build Muscle",
        beforePhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
        afterPhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
        useInAds: false,
      },
    ],
  });

  console.log("Seeding complete successfully! All three clients are set up under Alex.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  });
