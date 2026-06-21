import { useState } from "react";
import { Utensils, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function AIDietGenerator() {
  const [profile, setProfile] = useState({
    age: 28,
    gender: 'Male',
    weight: 85,
    height: 180,
    goal: 'Fat Loss',
    activityLevel: 'Moderate',
    dietType: 'Non-veg'
  });
  
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const generateDietPlan = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const data = await apiFetch("/ai/diet-plan", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      setDietPlan(data);
    } catch (err: any) {
      console.error("Failed to generate diet plan:", err);
      setError(err.message || "Failed to generate diet plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!dietPlan) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Diet Generator</h2>
          <p className="text-zinc-400">Enter your physical details to get a customized AI diet plan.</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800 space-y-6">
          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Age</label>
              <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: Number(e.target.value)})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Gender</label>
              <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Weight (kg)</label>
              <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Height (cm)</label>
              <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Goal</label>
              <select value={profile.goal} onChange={e => setProfile({...profile, goal: e.target.value})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white">
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Activity Level</label>
              <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white">
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderate</option>
                <option>Very Active</option>
                <option>Extra Active</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Diet Type</label>
              <select value={profile.dietType} onChange={e => setProfile({...profile, dietType: e.target.value})} className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white">
                <option>Vegan</option>
                <option>Vegetarian</option>
                <option>Non-veg</option>
              </select>
            </div>
          </div>
          <button 
            onClick={generateDietPlan}
            disabled={isGenerating}
            className="w-full bg-brand text-black py-3 rounded-lg font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
            {isGenerating ? "Generating Plan..." : "Generate AI Diet Plan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Your AI Diet Plan</h2>
          <p className="text-zinc-400">Personalized nutrition based on your profile.</p>
        </div>
        <button 
          onClick={() => setDietPlan(null)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm"
        >
          Edit Profile & Regenerate
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Daily Target</h3>
              <p className="text-zinc-400">Calculated for {profile.goal}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-brand">{dietPlan.calories}</span>
              <span className="text-zinc-400 ml-1">kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center">
              <div className="text-sm text-zinc-400 mb-1">Protein</div>
              <div className="text-xl font-bold text-white">{dietPlan.macros?.protein || dietPlan.protein}g</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center">
              <div className="text-sm text-zinc-400 mb-1">Carbs</div>
              <div className="text-xl font-bold text-white">{dietPlan.macros?.carbs || dietPlan.carbs}g</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center">
              <div className="text-sm text-zinc-400 mb-1">Fat</div>
              <div className="text-xl font-bold text-white">{dietPlan.macros?.fat || dietPlan.fat}g</div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">Today's Meal Plan</div>
            <div className="divide-y divide-zinc-800">
              {dietPlan.meals?.map((meal: any, idx: number) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-medium text-white">{meal.name}</h4>
                    <p className="text-sm text-zinc-400">{meal.description}</p>
                  </div>
                  <span className="text-sm font-medium text-brand">{meal.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800">
            <h3 className="font-semibold text-white mb-4">Grocery List</h3>
            <ul className="space-y-3">
              {dietPlan.groceryList?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" className="rounded text-brand focus:ring-brand bg-zinc-950 border-zinc-700" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
