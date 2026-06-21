import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function PersonalDietPlan() {
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await apiFetch("/user/plans");
        if (data.dietPlan && data.dietPlan.type === "COACH") {
          setDietPlan(data.dietPlan);
        }
      } catch (err) {
        console.error("Failed to load diet plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Diet Plan...
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-zinc-900 text-brand rounded-full flex items-center justify-center mb-4 border border-zinc-800">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Assigned Plan Yet</h2>
        <p className="text-zinc-400 max-w-md">Your personal coach has not created a custom diet plan for you yet. They will review your profile details and design a tailored protocol soon!</p>
        <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl text-brand text-xs max-w-md mt-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Tip: You can use the "AI Diet Generator" tab to create an instant AI plan in the meantime.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Coach's Diet Plan</h2>
        <p className="text-zinc-400">Your premium customized nutrition plan created by your Coach.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-brand/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand text-black text-xs font-bold px-3 py-1 rounded-bl-lg">ACTIVE</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-brand font-bold">
                C
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Custom Coaching Diet Protocol</h3>
                <p className="text-xs text-zinc-400">Published on {new Date(dietPlan.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Calories</div>
                <div className="font-bold text-white">{dietPlan.calories}</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Protein</div>
                <div className="font-bold text-white">{dietPlan.protein}g</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Carbs</div>
                <div className="font-bold text-white">{dietPlan.carbs}g</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Fat</div>
                <div className="font-bold text-white">{dietPlan.fat}g</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white border-b border-zinc-800 pb-2">Coach Notes</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                "Hey! Based on your check-in, I've adjusted your macros to optimize fat loss while keeping your energy high for training. Hit these numbers, drink plenty of water, and log your check-ins on time!"
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">Assigned Meals</div>
            <div className="divide-y divide-zinc-800">
              {dietPlan.meals?.map((meal: any, i: number) => (
                <div key={i} className="p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{meal.name}</h4>
                    <span className="text-sm font-medium text-brand">{meal.calories} kcal</span>
                  </div>
                  <p className="text-sm text-zinc-400">{meal.items || meal.description}</p>
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

          <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800">
            <h3 className="font-semibold text-white mb-4">Daily Checklist</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> Hit Protein Target
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> 3L Water Intake
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> Log Sleep and Steps
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
