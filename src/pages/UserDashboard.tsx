import { useState, useEffect } from "react";
import { 
  User, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  CalendarCheck, 
  MessageSquare, 
  CreditCard,
  LogOut,
  Menu,
  X,
  FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearToken } from "../lib/api";

import ProfileSetup from '../components/user/ProfileSetup';
import AIDietGenerator from '../components/user/AIDietGenerator';
import PersonalDietPlan from '../components/user/PersonalDietPlan';
import WorkoutPlan from '../components/user/WorkoutPlan';
import ProgressTracker from '../components/user/ProgressTracker';
import WeeklyCheckin from '../components/user/WeeklyCheckin';
import Chat from '../components/user/Chat';
import Payment from '../components/user/Payment';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleSignOut = () => {
    clearToken();
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: "Profile Setup", icon: User },
    { id: "diet", label: "AI Diet Generator", icon: Utensils },
    { id: "personal-diet", label: "Coach Diet Plan", icon: FileText },
    { id: "workout", label: "Workout Plan", icon: Dumbbell },
    { id: "progress", label: "Progress Tracker", icon: TrendingUp },
    { id: "checkin", label: "Weekly Check-in", icon: CalendarCheck },
    { id: "chat", label: "Chat with Coach", icon: MessageSquare },
    { id: "payment", label: "Payment System", icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSetup />;
      case "diet":
        return <AIDietGenerator />;
      case "personal-diet":
        return <PersonalDietPlan />;
      case "workout":
        return <WorkoutPlan />;
      case "progress":
        return <ProgressTracker />;
      case "checkin":
        return <WeeklyCheckin />;
      case "chat":
        return <Chat />;
      case "payment":
        return <Payment />;
      default:
        return <ProfileSetup />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-zinc-950 border-r border-zinc-900 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-900">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">FitByus</Link>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-black font-bold text-lg">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[130px]">{currentUser?.name || "User Client"}</p>
              <p className="text-xs text-brand">Premium Plan</p>
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
                      ? "bg-brand/10 text-brand" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand" : "text-zinc-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-zinc-950 border-b border-zinc-900 p-4 flex items-center md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg ml-2 text-white">FitByus</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
