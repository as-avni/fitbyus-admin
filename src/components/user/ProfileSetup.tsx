import React, { useState, useEffect } from "react";
import { apiFetch, getUser } from "../../lib/api";
import { Loader2, ShieldCheck } from "lucide-react";

export default function ProfileSetup() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: 28,
    gender: "Male",
    weight: 0,
    height: 0,
    goal: "Maintenance",
    activityLevel: "Moderate",
    dietType: "Non-veg",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const u = getUser();
        const data = await apiFetch("/user/profile");
        setProfile({
          name: u?.name || "",
          email: u?.email || "",
          age: data?.age || 28,
          gender: data?.gender || "Male",
          weight: data?.weight || 0,
          height: data?.height || 0,
          goal: data?.goal || "Maintenance",
          activityLevel: data?.activityLevel || "Moderate",
          dietType: data?.dietType || "Non-veg",
        });
      } catch (err: any) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/user/profile", {
        method: "POST",
        body: JSON.stringify({
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          goal: profile.goal,
          activityLevel: profile.activityLevel,
          dietType: profile.dietType,
        }),
      });
      setMessage("Profile saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile Setup</h2>
        <p className="text-zinc-400">Manage your physical attributes and fitness goals.</p>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800 space-y-6">
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Account Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Full Name</label>
              <input 
                type="text" 
                disabled
                value={profile.name} 
                className="w-full p-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Email Address</label>
              <input 
                type="email" 
                disabled
                value={profile.email} 
                className="w-full p-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Physical Attributes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Age</label>
              <input 
                type="number" 
                value={profile.age} 
                onChange={e => setProfile({...profile, age: Number(e.target.value)})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Gender</label>
              <select 
                value={profile.gender} 
                onChange={e => setProfile({...profile, gender: e.target.value})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={profile.weight} 
                onChange={e => setProfile({...profile, weight: Number(e.target.value)})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Height (cm)</label>
              <input 
                type="number" 
                value={profile.height} 
                onChange={e => setProfile({...profile, height: Number(e.target.value)})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Fitness Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Goal</label>
              <select 
                value={profile.goal} 
                onChange={e => setProfile({...profile, goal: e.target.value})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white"
              >
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Activity Level</label>
              <select 
                value={profile.activityLevel} 
                onChange={e => setProfile({...profile, activityLevel: e.target.value})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white"
              >
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderate</option>
                <option>Very Active</option>
                <option>Extra Active</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Diet Type</label>
              <select 
                value={profile.dietType} 
                onChange={e => setProfile({...profile, dietType: e.target.value})} 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white"
              >
                <option>Vegan</option>
                <option>Vegetarian</option>
                <option>Non-veg</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-brand text-black py-2.5 rounded-lg font-semibold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
