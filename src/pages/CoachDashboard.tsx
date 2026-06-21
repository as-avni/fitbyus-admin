import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Utensils, 
  Dumbbell, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  TrendingDown,
  Activity,
  Sparkles,
  Clock,
  ArrowLeft,
  Settings,
  Mail,
  Scale
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, clearToken, getUser, connectChatSocket } from "../lib/api";

export default function CoachDashboard() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Selected client. If null/empty, we show the Client Grid.
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  // Data loading states
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Unified Workspace state variables for the selected client
  const [dietCalories, setDietCalories] = useState(2000);
  const [dietProtein, setDietProtein] = useState(150);
  const [dietCarbs, setDietCarbs] = useState(200);
  const [dietFat, setDietFat] = useState(65);
  const [dietMeals, setDietMeals] = useState<any[]>([]);
  const [groceryInput, setGroceryInput] = useState("");
  const [publishingDiet, setPublishingDiet] = useState(false);

  // Workout Builder State
  const [workoutSplitName, setWorkoutSplitName] = useState("Push-Pull-Legs");
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [publishingWorkout, setPublishingWorkout] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Client sub-tab state inside workspace (defaults to insights, but all details are visible on the page)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("insights"); // "insights" | "diet" | "workout" | "checkins"

  useEffect(() => {
    setCurrentUser(getUser());
    loadCoachData();
  }, []);

  // Update editor states when selected client changes
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        // Diet Editor Prefill
        if (client.dietPlans && client.dietPlans.length > 0) {
          const plan = client.dietPlans.find((p: any) => p.type === "COACH") || client.dietPlans[0];
          setDietCalories(plan.calories);
          setDietProtein(plan.protein);
          setDietCarbs(plan.carbs);
          setDietFat(plan.fat);
          setDietMeals(plan.meals || []);
          setGroceryInput(plan.groceryList ? plan.groceryList.join(", ") : "");
        } else {
          setDietCalories(2000);
          setDietProtein(150);
          setDietCarbs(200);
          setDietFat(65);
          setDietMeals([
            { name: "Breakfast", items: "Oats (50g) + Eggs/Tofu", calories: 400 },
            { name: "Lunch", items: "Rice + Beans/Chicken + Veggies", calories: 600 },
            { name: "Dinner", items: "Fish/Lentils + Sweet Potato + Broccoli", calories: 500 },
          ]);
          setGroceryInput("Oats, Eggs, Tofu, Chicken Breast, Lentils, Rice, Broccoli, Sweet Potato");
        }

        // Workout Builder Prefill
        if (client.workoutPlans && client.workoutPlans.length > 0) {
          const plan = client.workoutPlans[0];
          setWorkoutSplitName(plan.splitName);
          setWorkoutDays(plan.days || []);
        } else {
          setWorkoutSplitName("Push-Pull-Legs");
          setWorkoutDays([
            {
              name: "Day 1: Push Routine",
              exercises: [
                { name: "Flat Bench Press", sets: "3", reps: "8-10", rest: "90s" },
                { name: "Overhead Dumbbell Press", sets: "3", reps: "10-12", rest: "60s" }
              ]
            }
          ]);
        }

        // Chat logs loading & WebSocket subscription
        apiFetch(`/chat/messages?otherUserId=${client.userId}`)
          .then(msgs => setChatMessages(msgs))
          .catch(err => console.error("Failed to load chat history:", err));

        const socket = connectChatSocket((msg) => {
          if (msg.senderId === client.userId || msg.receiverId === client.userId) {
            setChatMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        });

        return () => {
          if (socket) socket.close();
        };
      }
    }
  }, [selectedClientId, clients]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadCoachData = async () => {
    setLoading(true);
    try {
      const clientsList = await apiFetch("/coach/clients");
      setClients(clientsList);
    } catch (err) {
      console.error("Failed to load coach data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    navigate("/");
  };

  // Diet Editor Helpers
  const handleAddMeal = () => {
    setDietMeals([...dietMeals, { name: "New Meal", items: "Ingredients details", calories: 300 }]);
  };

  const handleMealChange = (index: number, field: string, value: any) => {
    const updated = [...dietMeals];
    updated[index] = { ...updated[index], [field]: value };
    setDietMeals(updated);
  };

  const handleRemoveMeal = (index: number) => {
    const updated = [...dietMeals];
    updated.splice(index, 1);
    setDietMeals(updated);
  };

  const handlePublishDiet = async () => {
    if (!selectedClientId) return;
    setPublishingDiet(true);
    try {
      const groceryList = groceryInput.split(",").map(i => i.trim()).filter(Boolean);
      await apiFetch("/coach/diet-plan", {
        method: "POST",
        body: JSON.stringify({
          clientId: selectedClientId,
          calories: dietCalories,
          protein: dietProtein,
          carbs: dietCarbs,
          fat: dietFat,
          meals: dietMeals,
          groceryList,
        }),
      });
      alert("Diet plan saved and published to client dashboard successfully!");
      loadCoachData();
    } catch (err) {
      alert("Failed to save diet plan.");
    } finally {
      setPublishingDiet(false);
    }
  };

  // Workout Editor Helpers
  const handleAddDay = () => {
    setWorkoutDays([...workoutDays, { name: "Day " + (workoutDays.length + 1) + ": Focus Split", exercises: [{ name: "New Exercise", sets: "3", reps: "10", rest: "60s" }] }]);
  };

  const handleAddExercise = (dayIdx: number) => {
    const updated = [...workoutDays];
    updated[dayIdx].exercises.push({ name: "New Exercise", sets: "3", reps: "10", rest: "60s" });
    setWorkoutDays(updated);
  };

  const handleExerciseChange = (dayIdx: number, exIdx: number, field: string, value: string) => {
    const updated = [...workoutDays];
    updated[dayIdx].exercises[exIdx] = { ...updated[dayIdx].exercises[exIdx], [field]: value };
    setWorkoutDays(updated);
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...workoutDays];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setWorkoutDays(updated);
  };

  const handleRemoveDay = (dayIdx: number) => {
    const updated = [...workoutDays];
    updated.splice(dayIdx, 1);
    setWorkoutDays(updated);
  };

  const handlePublishWorkout = async () => {
    if (!selectedClientId) return;
    setPublishingWorkout(true);
    try {
      await apiFetch("/coach/workout-plan", {
        method: "POST",
        body: JSON.stringify({
          clientId: selectedClientId,
          splitName: workoutSplitName,
          days: workoutDays,
        }),
      });
      alert("Workout plan saved and published to client dashboard successfully!");
      loadCoachData();
    } catch (err) {
      alert("Failed to save workout plan.");
    } finally {
      setPublishingWorkout(false);
    }
  };

  // Chat message send handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClient = clients.find(c => c.id === selectedClientId);
    if (!newChatMessage.trim() || !activeClient) return;

    setSendingMessage(true);
    const content = newChatMessage.trim();
    setNewChatMessage("");

    try {
      const msg = await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: activeClient.userId,
          content,
        }),
      });
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Get active client context info
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  // Compute insights
  const computeClientInsights = (client: any) => {
    if (!client) return null;
    const checks = client.checkIns || [];
    const startingWeight = checks.length > 0 ? checks[checks.length - 1].weight : client.weight;
    const currentWeight = client.weight;
    const totalDiff = currentWeight - startingWeight;

    let adherenceRating = "Excellent";
    let complianceScore = 10;
    if (checks.length > 0) {
      const notesConcat = checks.map((c: any) => c.notes.toLowerCase()).join(" ");
      if (notesConcat.includes("struggled") || notesConcat.includes("missed") || notesConcat.includes("cheat")) {
        adherenceRating = "Moderate";
        complianceScore = 7;
      }
      if (notesConcat.includes("poor") || notesConcat.includes("failed") || notesConcat.includes("lazy")) {
        adherenceRating = "Action Needed";
        complianceScore = 5;
      }
    }

    let recommendations = "Sticking with the current protocol. Client is making solid progress.";
    if (client.goal === "Fat Loss" && totalDiff >= 0 && checks.length > 1) {
      recommendations = "Weight loss has stalled. Consider reducing daily carbs by 30-40g or adding 20 mins of daily LISS cardio.";
    } else if (client.goal === "Muscle Gain" && totalDiff <= 0 && checks.length > 1) {
      recommendations = "Weight is stagnant. Increase daily target calories by 250 kcal (add clean carbs to pre-workout split).";
    }

    return {
      startingWeight,
      currentWeight,
      totalDiff: (totalDiff >= 0 ? "+" : "") + totalDiff.toFixed(1) + " kg",
      adherenceRating,
      complianceScore,
      recommendations
    };
  };

  const insights = computeClientInsights(selectedClient);

  // Format Recharts data
  const getWeightChartData = (client: any) => {
    if (!client || !client.checkIns) return [];
    return [...client.checkIns]
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((c: any) => ({
        name: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: c.weight
      }));
  };

  const weightChartData = getWeightChartData(selectedClient);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400 flex items-center">
          <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Coach Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 flex">
      {/* Sidebar (Simple header & logout) */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-tight block mb-6">FitByus</Link>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-black font-bold">
              {currentUser?.name?.charAt(0) || "C"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[130px]">Coach {currentUser?.name || "Alex"}</p>
              <p className="text-[10px] text-brand font-medium">Head Trainer</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-2">
            <button 
              onClick={() => setSelectedClientId("")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !selectedClientId 
                  ? "bg-brand/10 text-brand" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> My Clients
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-zinc-950 border-b border-zinc-900 p-4 flex items-center justify-between md:hidden">
          <span className="font-bold text-lg text-white">FitByus Coach</span>
          <button onClick={handleSignOut} className="p-2 text-zinc-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* SCREEN A: Grid of all Clients */}
            {!selectedClientId ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Clients Cockpit</h2>
                  <p className="text-zinc-400">Select any client to open their full-screen interactive workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clients.map((client) => {
                    const clientInsights = computeClientInsights(client);
                    return (
                      <div 
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-brand/40 transition-all shadow-md group cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-zinc-850 rounded-full flex items-center justify-center text-brand font-bold text-lg">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-base group-hover:text-brand transition-colors">{client.name}</h3>
                                <p className="text-xs text-zinc-500">{client.goal}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              clientInsights?.adherenceRating === "Excellent" ? "bg-emerald-500/10 text-emerald-400" :
                              clientInsights?.adherenceRating === "Moderate" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {clientInsights?.adherenceRating}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-b border-zinc-800 py-3">
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase block">Weight</span>
                              <span className="font-semibold text-white text-sm">{client.weight} kg</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase block">Weekly Trend</span>
                              <span className="font-semibold text-white text-sm">{client.trend}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase block">Diet Plan</span>
                              <span className="font-semibold text-brand text-sm">
                                {client.dietPlans && client.dietPlans.length > 0 ? `${client.dietPlans[0].calories} kcal` : "Unassigned"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase block">Split</span>
                              <span className="font-semibold text-zinc-300 text-sm truncate block max-w-[120px]">
                                {client.workoutPlans && client.workoutPlans.length > 0 ? client.workoutPlans[0].splitName : "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientId(client.id);
                          }}
                          className="w-full mt-5 bg-zinc-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-brand hover:text-black transition-colors flex items-center justify-center gap-1"
                        >
                          Open Workspace <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              
              // SCREEN B: Full-Screen Client Workspace Cockpit
              <div className="space-y-6">
                
                {/* Workspace Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-sm">
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSelectedClientId("")}
                      className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs font-semibold transition-colors mb-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Clients list
                    </button>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                      {selectedClient?.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        insights?.adherenceRating === "Excellent" ? "bg-emerald-500/10 text-emerald-400" :
                        insights?.adherenceRating === "Moderate" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {insights?.adherenceRating}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {selectedClient?.email} • Goal: <span className="text-brand font-medium">{selectedClient?.goal}</span> • Preference: <span className="text-zinc-300">{selectedClient?.dietType}</span>
                    </p>
                  </div>
                  
                  {/* Quick stats details row */}
                  <div className="flex gap-4 text-center">
                    <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase">Age / Gender</span>
                      <p className="font-bold text-white text-sm mt-0.5">{selectedClient?.age} / {selectedClient?.gender}</p>
                    </div>
                    <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase">Weight / Height</span>
                      <p className="font-bold text-white text-sm mt-0.5">{selectedClient?.weight}kg / {selectedClient?.height}cm</p>
                    </div>
                  </div>
                </div>

                {/* Workspace Grid Layout - Showcase all information concurrently */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLUMN 1: Insights & Messaging (Real-time Workspace Side) */}
                  <div className="space-y-6 lg:col-span-1">
                    
                    {/* Insights Block */}
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand" /> Coaching Insights & Action
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                          <span className="text-[9px] text-zinc-500 uppercase">Start</span>
                          <p className="font-semibold text-zinc-300">{insights?.startingWeight} kg</p>
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                          <span className="text-[9px] text-zinc-500 uppercase">Current</span>
                          <p className="font-semibold text-zinc-300">{insights?.currentWeight} kg</p>
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                          <span className="text-[9px] text-zinc-500 uppercase">Net</span>
                          <p className={`font-semibold ${insights?.totalDiff.startsWith('-') && selectedClient?.goal === 'Fat Loss' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {insights?.totalDiff}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-xs">
                        <span className="font-semibold text-brand block mb-1">Weekly Coach Action:</span>
                        <p className="text-zinc-400 leading-relaxed italic">"{insights?.recommendations}"</p>
                      </div>
                    </div>

                    {/* Weight Logs Chart */}
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Scale className="w-4 h-4 text-zinc-400" /> Weight Progress logs
                      </h3>
                      <div className="h-44">
                        {weightChartData.length === 0 ? (
                          <p className="text-center text-zinc-500 text-xs py-12">No weight check-ins logged.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightChartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 9}} dy={8} />
                              <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 9}} dx={-8} />
                              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff', fontSize: '10px' }} />
                              <Line type="monotone" dataKey="weight" stroke="#f9c126" strokeWidth={2} dot={{fill: '#f9c126', r: 3}} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Live chat portal inside workspace */}
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-96">
                      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand" />
                        <h3 className="font-bold text-white text-sm">Direct Client Chat</h3>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-zinc-950/30 text-xs">
                        {chatMessages.length === 0 ? (
                          <p className="text-center text-zinc-600 py-12">No chat records.</p>
                        ) : (
                          chatMessages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser?.id;
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2.5 rounded-xl max-w-[80%] ${
                                  isMe ? 'bg-brand text-black font-medium' : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendChatMessage} className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-1.5">
                        <input 
                          type="text" 
                          value={newChatMessage}
                          onChange={e => setNewChatMessage(e.target.value)}
                          placeholder="Type message..." 
                          className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-brand" 
                        />
                        <button 
                          type="submit"
                          disabled={!newChatMessage.trim() || sendingMessage}
                          className="bg-brand text-black p-2 rounded-lg hover:bg-brand-hover flex items-center justify-center disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* COLUMN 2: Custom Diet Editor (Workspace Center) */}
                  <div className="space-y-6 lg:col-span-1">
                    
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-5">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-brand" /> Diet Plan Editor
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">Calories: {dietCalories} kcal</span>
                      </div>

                      {/* Macros Inputs */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase block mb-1">Calories</label>
                          <input type="number" value={dietCalories} onChange={e => setDietCalories(Number(e.target.value))} className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-center text-white outline-none focus:ring-1 focus:ring-brand font-semibold" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase block mb-1">Prot(g)</label>
                          <input type="number" value={dietProtein} onChange={e => setDietProtein(Number(e.target.value))} className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-center text-white outline-none focus:ring-1 focus:ring-brand font-semibold" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase block mb-1">Carb(g)</label>
                          <input type="number" value={dietCarbs} onChange={e => setDietCarbs(Number(e.target.value))} className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-center text-white outline-none focus:ring-1 focus:ring-brand font-semibold" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase block mb-1">Fat(g)</label>
                          <input type="number" value={dietFat} onChange={e => setDietFat(Number(e.target.value))} className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-center text-white outline-none focus:ring-1 focus:ring-brand font-semibold" />
                        </div>
                      </div>

                      {/* Meals list */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold text-white">
                          <span>Meals Protocol</span>
                          <button onClick={handleAddMeal} className="text-brand hover:text-brand-hover flex items-center gap-0.5 text-[10px]">
                            <Plus className="w-3.5 h-3.5" /> Add Meal
                          </button>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                          {dietMeals.map((meal, idx) => (
                            <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-2 relative group">
                              <button 
                                onClick={() => handleRemoveMeal(idx)}
                                className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 text-xs hidden group-hover:block transition-all"
                              >
                                Remove
                              </button>
                              <div className="flex justify-between items-center gap-4">
                                <input 
                                  type="text" 
                                  value={meal.name} 
                                  onChange={e => handleMealChange(idx, "name", e.target.value)}
                                  className="font-bold text-white bg-transparent outline-none border-b border-transparent hover:border-zinc-800 focus:border-brand w-2/3 text-xs" 
                                />
                                <input 
                                  type="number" 
                                  value={meal.calories} 
                                  onChange={e => handleMealChange(idx, "calories", Number(e.target.value))}
                                  className="w-12 text-xs bg-transparent border-b border-transparent hover:border-zinc-800 text-right text-brand font-semibold outline-none" 
                                  placeholder="cals"
                                />
                              </div>
                              <textarea 
                                value={meal.items || meal.description} 
                                onChange={e => handleMealChange(idx, "items", e.target.value)}
                                rows={2}
                                className="w-full text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-850 rounded p-1.5 outline-none resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grocery List inputs */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Grocery Checklist ingredients</label>
                        <textarea 
                          value={groceryInput}
                          onChange={e => setGroceryInput(e.target.value)}
                          rows={2}
                          className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-850 rounded-lg p-2 outline-none"
                          placeholder="Eggs, Oats, Salmon..."
                        />
                      </div>

                      <button 
                        onClick={handlePublishDiet}
                        disabled={publishingDiet}
                        className="w-full bg-brand text-black py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5 text-xs"
                      >
                        {publishingDiet && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save & Publish Diet Plan
                      </button>
                    </div>

                  </div>

                  {/* COLUMN 3: Workout Split Builder & Check-in Feed (Workspace Right) */}
                  <div className="space-y-6 lg:col-span-1">
                    
                    {/* Workout split card */}
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-brand" /> Workout Builder
                        </h3>
                        <button onClick={handleAddDay} className="text-brand hover:text-brand-hover flex items-center gap-0.5 text-[10px]">
                          <Plus className="w-3.5 h-3.5" /> Add Day
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <label className="text-[10px] text-zinc-500 uppercase">Split Name</label>
                        <input 
                          type="text" 
                          value={workoutSplitName} 
                          onChange={e => setWorkoutSplitName(e.target.value)}
                          className="p-1 bg-zinc-950 border border-zinc-850 rounded text-white text-xs outline-none w-full" 
                        />
                      </div>

                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        {workoutDays.map((day, dIdx) => (
                          <div key={dIdx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-2 relative group">
                            <button 
                              onClick={() => handleRemoveDay(dIdx)}
                              className="absolute top-2 right-2 text-[10px] text-zinc-600 hover:text-red-500 hidden group-hover:block"
                            >
                              Remove Day
                            </button>
                            <input 
                              type="text" 
                              value={day.name} 
                              onChange={e => {
                                const updated = [...workoutDays];
                                updated[dIdx].name = e.target.value;
                                setWorkoutDays(updated);
                              }}
                              className="font-bold text-white bg-transparent outline-none text-xs w-2/3 border-b border-transparent focus:border-brand p-0.5" 
                            />
                            
                            <table className="w-full text-[10px] text-left">
                              <thead>
                                <tr className="text-zinc-500 border-b border-zinc-900">
                                  <th className="py-1">Exercise</th>
                                  <th className="py-1 w-12 text-center">Sets</th>
                                  <th className="py-1 w-16 text-center">Reps</th>
                                  <th className="py-1 w-16 text-center">Rest</th>
                                </tr>
                              </thead>
                              <tbody>
                                {day.exercises?.map((ex: any, exIdx: number) => (
                                  <tr key={exIdx} className="border-b border-zinc-900 last:border-0 relative group/ex">
                                    <td className="py-1">
                                      <input type="text" value={ex.name} onChange={e => handleExerciseChange(dIdx, exIdx, "name", e.target.value)} className="bg-transparent border-0 p-0 text-white outline-none w-full text-[10px]" />
                                    </td>
                                    <td className="py-1">
                                      <input type="text" value={ex.sets} onChange={e => handleExerciseChange(dIdx, exIdx, "sets", e.target.value)} className="bg-transparent border-0 p-0 text-center text-zinc-300 outline-none w-full text-[10px]" />
                                    </td>
                                    <td className="py-1">
                                      <input type="text" value={ex.reps} onChange={e => handleExerciseChange(dIdx, exIdx, "reps", e.target.value)} className="bg-transparent border-0 p-0 text-center text-zinc-300 outline-none w-full text-[10px]" />
                                    </td>
                                    <td className="py-1">
                                      <input type="text" value={ex.rest} onChange={e => handleExerciseChange(dIdx, exIdx, "rest", e.target.value)} className="bg-transparent border-0 p-0 text-center text-zinc-300 outline-none w-full text-[10px]" />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button onClick={() => handleAddExercise(dIdx)} className="text-[10px] text-zinc-500 hover:text-brand font-medium pt-1 flex items-center gap-0.5">
                              <Plus className="w-3 h-3" /> Add Exercise
                            </button>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={handlePublishWorkout}
                        disabled={publishingWorkout}
                        className="w-full bg-brand text-black py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5 text-xs"
                      >
                        {publishingWorkout && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Workout split
                      </button>
                    </div>

                    {/* Check-ins logs feed */}
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400" /> Weekly Check-in Logs
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                        {selectedClient?.checkIns && selectedClient.checkIns.length > 0 ? (
                          selectedClient.checkIns.map((chk: any, idx: number) => (
                            <div key={idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1.5">
                              <div className="flex justify-between items-center font-medium">
                                <span className="text-brand">Weight: {chk.weight} kg</span>
                                <span className="text-zinc-500 text-[10px]">{new Date(chk.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 flex gap-3">
                                <span>{chk.energyLevel}</span>
                                <span>{chk.sleepQuality}</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 italic">"{chk.notes}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-zinc-500 text-center py-8">No check-ins logged.</p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
