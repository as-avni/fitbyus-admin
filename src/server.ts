import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Controllers and Route Handlers
import { register, login, getMe, requireAuth } from "./server/auth";
import { generateAIDietPlan } from "./server/ai";
import {
  getClientProfile,
  upsertClientProfile,
  getClientPlans,
  getClientCheckIns,
  submitCheckIn,
  getCoachClients,
  publishDietPlan,
  publishWorkoutPlan,
  getCoachProfile,
  getAdminStats,
  getAdminClients,
  assignCoach,
  getAdminCoaches,
  approveCoach,
  updateCommission,
  getTransformations,
  createTransformation,
  toggleTransformationAd,
  getChatMessages,
  sendChatMessage
} from "./server/controllers";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(cors({
  origin: "*", // Adjust in production to frontend origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ==========================================
// PUBLIC ROUTES
// ==========================================
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/transformations", getTransformations); // Publicly viewable transform gallery

// ==========================================
// PROTECTED ROUTES (JWT REQUIRED)
// ==========================================
app.get("/api/auth/me", requireAuth, getMe);

// AI Generator
app.post("/api/ai/diet-plan", requireAuth, generateAIDietPlan);

// Client Dashboard endpoints
app.get("/api/user/profile", requireAuth, getClientProfile);
app.post("/api/user/profile", requireAuth, upsertClientProfile);
app.get("/api/user/plans", requireAuth, getClientPlans);
app.get("/api/user/checkins", requireAuth, getClientCheckIns);
app.post("/api/user/checkin", requireAuth, submitCheckIn);

// Coach Dashboard endpoints
app.get("/api/coach/clients", requireAuth, getCoachClients);
app.post("/api/coach/diet-plan", requireAuth, publishDietPlan);
app.post("/api/coach/workout-plan", requireAuth, publishWorkoutPlan);
app.get("/api/coach/profile", requireAuth, getCoachProfile); // Gets coach own profile config

// Admin Dashboard endpoints
app.get("/api/admin/stats", requireAuth, getAdminStats);
app.get("/api/admin/clients", requireAuth, getAdminClients);
app.post("/api/admin/client/assign-coach", requireAuth, assignCoach);
app.get("/api/admin/coaches", requireAuth, getAdminCoaches);
app.post("/api/admin/coach/approve", requireAuth, approveCoach);
app.post("/api/admin/coach/commission", requireAuth, updateCommission);
app.post("/api/admin/transformations", requireAuth, createTransformation);
app.post("/api/admin/transformations/toggle-ad", requireAuth, toggleTransformationAd);

// Chat / Messages Endpoints
app.get("/api/chat/messages", requireAuth, getChatMessages);
app.post("/api/chat/messages", requireAuth, sendChatMessage);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Create HTTP Server
const server = http.createServer(app);

// ==========================================
// WEBSOCKET BROKER FOR REAL-TIME CHAT
// ==========================================
export const wsClients = new Map<string, Set<WebSocket>>();

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  // Simple token/query authentication for WebSockets
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const token = url.searchParams.get("token");
  
  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  // Parse JWT
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "fitbyus-super-secret-key-12345";
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, decoded.id);
    });
  } catch (err) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (ws: WebSocket, userId: string) => {
  if (!wsClients.has(userId)) {
    wsClients.set(userId, new Set());
  }
  wsClients.get(userId)!.add(ws);

  ws.on("close", () => {
    const userSockets = wsClients.get(userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        wsClients.delete(userId);
      }
    }
  });

  ws.on("error", (err) => {
    console.error(`WebSocket error for user ${userId}:`, err);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 FitByus Backend Server running at http://localhost:${PORT}`);
});
