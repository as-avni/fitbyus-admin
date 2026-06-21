import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "fitbyus-super-secret-key-12345";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Authentication Middleware
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Register Controller
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, role, coachDetails } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Please provide email, password, name, and role." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role.toUpperCase(), // "ADMIN", "COACH", "CLIENT"
      },
    });

    // If role is COACH, create coach profile (pending state by default, unless ADMIN created it)
    if (user.role === "COACH") {
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
          experience: coachDetails?.experience || "Not specified",
          certification: coachDetails?.certification || "Not specified",
          status: "PENDING",
        },
      });
    }

    // If role is CLIENT, create user profile with default/empty values
    if (user.role === "CLIENT") {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          age: 0,
          gender: "Male",
          weight: 0,
          height: 0,
          goal: "Maintenance",
          activityLevel: "Moderate",
          dietType: "Non-veg",
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message || "Registration failed." });
  }
}

// Login Controller
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        coachProfile: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Check if coach is pending approval
    if (user.role === "COACH" && user.coachProfile?.status === "PENDING") {
      // Allow login, but they might have limited coach views. We'll pass the status in response.
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId: user.clientProfile?.id || user.coachProfile?.id || null,
        coachStatus: user.coachProfile?.status || null,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
}

// Me Controller
export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        clientProfile: true,
        coachProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.clientProfile || user.coachProfile || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve user details." });
  }
}
