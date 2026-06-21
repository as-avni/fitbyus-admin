import { useState, useEffect } from "react";
import { Dumbbell, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function WorkoutPlan() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await apiFetch("/user/plans");
        if (data.workoutPlan) {
          setWorkoutPlan(data.workoutPlan);
        }
      } catch (err) {
        console.error("Failed to load workout plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Workout Plan...
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-zinc-900 text-brand rounded-full flex items-center justify-center mb-4 border border-zinc-800">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Assigned Workout Yet</h2>
        <p className="text-zinc-400 max-w-md">Your coach has not designed a custom training routine for you yet. Once they publish your workouts, they will show up here.</p>
        <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl text-brand text-xs max-w-md mt-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Tip: Message your coach in the "Chat with Coach" tab to request a workout split!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Workout Plan</h2>
          <p className="text-zinc-400">Your weekly training schedule: <span className="text-brand font-medium">{workoutPlan.splitName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutPlan.days?.map((day: any, i: number) => (
          <div key={i} className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <h3 className="font-semibold text-white">{day.name}</h3>
              <span className="text-xs font-medium px-2 py-1 bg-brand/20 text-brand rounded-full">{day.exercises?.length || 0} Exercises</span>
            </div>
            <div className="p-4 space-y-4">
              {day.exercises?.map((ex: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start border-b border-zinc-800/40 pb-3 last:border-b-0 last:pb-0">
                  <div className="w-10 h-10 bg-zinc-850 rounded flex-shrink-0 flex items-center justify-center text-zinc-500 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{ex.name}</h4>
                    <p className="text-xs text-zinc-400">
                      {ex.sets} sets x {ex.reps} reps {ex.rest ? `• Rest: ${ex.rest}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
