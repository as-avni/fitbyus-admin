import React, { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  UserCheck, 
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiFetch, clearToken, getUser } from "../lib/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("revenue");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [pendingCoaches, setPendingCoaches] = useState<any[]>([]);
  const [activeCoaches, setActiveCoaches] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<any[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Upload Transformation state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBeforeUrl, setNewBeforeUrl] = useState("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500");
  const [newAfterUrl, setNewAfterUrl] = useState("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500");
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    setCurrentUser(getUser());
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const dashboardStats = await apiFetch("/admin/stats");
      setStats(dashboardStats);

      const clientsList = await apiFetch("/admin/clients");
      setClients(clientsList);

      const coachesResponse = await apiFetch("/admin/coaches");
      setPendingCoaches(coachesResponse.pending || []);
      setActiveCoaches(coachesResponse.active || []);

      const transforms = await apiFetch("/transformations");
      setTransformations(transforms);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    navigate("/");
  };

  // Coach assignment change
  const handleAssignCoach = async (clientId: string, coachId: string) => {
    setMessage("");
    setError("");
    try {
      await apiFetch("/admin/client/assign-coach", {
        method: "POST",
        body: JSON.stringify({ clientId, coachId }),
      });
      setMessage("Coach assigned successfully!");
      loadAllAdminData();
    } catch (err) {
      setError("Failed to assign coach.");
    }
  };

  // Approve pending coach
  const handleApproveCoach = async (coachId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch("/admin/coach/approve", {
        method: "POST",
        body: JSON.stringify({ coachId, status }),
      });
      loadAllAdminData();
    } catch (err) {
      alert("Failed to update coach status.");
    }
  };

  // Update commission rate
  const handleUpdateCommission = async (coachId: string, commissionRate: number) => {
    try {
      await apiFetch("/admin/coach/commission", {
        method: "POST",
        body: JSON.stringify({ coachId, commissionRate }),
      });
      loadAllAdminData();
    } catch (err) {
      alert("Failed to update commission rate.");
    }
  };

  // Toggle transformation Use in Ads
  const handleToggleAd = async (id: string, useInAds: boolean) => {
    try {
      await apiFetch("/admin/transformations/toggle-ad", {
        method: "POST",
        body: JSON.stringify({ id, useInAds }),
      });
      loadAllAdminData();
    } catch (err) {
      alert("Failed to update transformation settings.");
    }
  };

  // Add new transformation
  const handleCreateTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/transformations", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          beforePhotoUrl: newBeforeUrl,
          afterPhotoUrl: newAfterUrl,
          useInAds: false,
        }),
      });
      setNewTitle("");
      setNewDesc("");
      setShowUploadForm(false);
      loadAllAdminData();
    } catch (err) {
      alert("Failed to save new transformation.");
    }
  };

  const tabs = [
    { id: "revenue", label: "Revenue Dashboard", icon: DollarSign },
    { id: "users", label: "User Management", icon: Users },
    { id: "coaches", label: "Coach Management", icon: UserCheck },
    { id: "gallery", label: "Transformation Gallery", icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400 flex items-center">
          <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Admin Portal...
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "revenue":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Revenue Dashboard</h2>
              <p className="text-zinc-400">Overview of your business performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-400">Total Revenue</h3>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">₹{stats?.totalRevenue?.toLocaleString()}</div>
                  <p className="text-sm text-brand font-medium mt-1">+12.5% from last month</p>
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-400">Active Clients</h3>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{stats?.activeClients}</div>
                  <p className="text-sm text-brand font-medium mt-1">+24 new this week</p>
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-400">Monthly Subscriptions</h3>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{stats?.subscriptions}</div>
                  <p className="text-sm text-zinc-500 font-medium mt-1">Recurring rate active</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-96">
              <h3 className="font-semibold text-white mb-6">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#18181b'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff' }}
                  />
                  <Bar dataKey="revenue" fill="#f9c126" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-zinc-400">Manage clients and assign coaches.</p>
              </div>
            </div>

            {message && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {message}
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Client Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Goal</th>
                      <th className="px-6 py-4 font-medium">Assigned Coach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {clients.map((client, i) => (
                      <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                        <td className="px-6 py-4 text-zinc-400">{client.email}</td>
                        <td className="px-6 py-4 text-zinc-400">{client.goal}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={activeCoaches.find(c => c.name === client.coach)?.id || ""}
                            onChange={(e) => handleAssignCoach(client.id, e.target.value)}
                            className="text-sm border border-zinc-700 rounded p-1.5 bg-zinc-800 text-brand font-medium focus:ring-2 focus:ring-brand outline-none"
                          >
                            <option value="">Unassigned</option>
                            {activeCoaches.map((coach) => (
                              <option key={coach.id} value={coach.id}>{coach.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "coaches":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Coach Management</h2>
              <p className="text-zinc-400">Approve coaches and set their commission rates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">
                  Pending Approvals
                </div>
                <div className="divide-y divide-zinc-800">
                  {pendingCoaches.length === 0 ? (
                    <div className="p-4 text-zinc-500 text-sm">No pending approvals.</div>
                  ) : (
                    pendingCoaches.map((coach, i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold">
                            {coach.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{coach.name}</h4>
                            <p className="text-xs text-zinc-500">{coach.experience} exp • {coach.certification}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApproveCoach(coach.id, "APPROVED")}
                            className="p-1.5 text-brand bg-brand/10 rounded hover:bg-brand/20"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleApproveCoach(coach.id, "REJECTED")}
                            className="p-1.5 text-red-500 bg-red-500/10 rounded hover:bg-red-500/20"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">
                  Active Coaches
                </div>
                <div className="divide-y divide-zinc-800">
                  {activeCoaches.map((coach, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold">
                          {coach.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Coach {coach.name}</h4>
                          <p className="text-xs text-zinc-500">{coach.clients} Active Clients</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-500">Comm. %</label>
                        <input 
                          type="number" 
                          defaultValue={coach.comm} 
                          onBlur={(e) => handleUpdateCommission(coach.id, Number(e.target.value))}
                          className="w-16 p-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:ring-2 focus:ring-brand outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "gallery":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Transformation Gallery</h2>
                <p className="text-zinc-400">Manage before/after photos for marketing.</p>
              </div>
              <button 
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" /> {showUploadForm ? "Close Form" : "Upload New"}
              </button>
            </div>

            {showUploadForm && (
              <form onSubmit={handleCreateTransformation} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-lg space-y-4">
                <h3 className="font-semibold text-white">Add Transformation Photo</h3>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Title</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-white" placeholder="Client Transformation #X" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Description</label>
                  <input type="text" required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-white" placeholder="12 Week Program • -10kg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Before Photo URL</label>
                    <input type="text" value={newBeforeUrl} onChange={e => setNewBeforeUrl(e.target.value)} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">After Photo URL</label>
                    <input type="text" value={newAfterUrl} onChange={e => setNewAfterUrl(e.target.value)} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white" />
                  </div>
                </div>
                <button type="submit" className="bg-brand text-black px-4 py-2 rounded text-sm font-semibold hover:bg-brand-hover">Submit transformation</button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformations.map((item) => (
                <div key={item.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group">
                  <div className="aspect-video bg-zinc-950 flex items-center justify-center text-zinc-500 border-b border-zinc-800 relative">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 border-r border-zinc-800 flex items-center justify-center bg-zinc-900/50 text-xs">Before</div>
                      <div className="w-1/2 flex items-center justify-center bg-zinc-800/50 text-xs">After</div>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-zinc-400">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs font-medium text-zinc-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.useInAds} 
                          onChange={(e) => handleToggleAd(item.id, e.target.checked)}
                          className="rounded text-brand focus:ring-brand bg-zinc-800 border-zinc-700" 
                        />
                        Use in Ads
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">FitByus Admin</Link>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-black font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[130px]">{currentUser?.name || "Admin User"}</p>
              <p className="text-xs text-zinc-400">Superadmin</p>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-brand text-black" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-zinc-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 text-zinc-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg ml-2 text-white">FitByus Admin</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
