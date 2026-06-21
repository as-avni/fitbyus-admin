import React, { useState } from "react";
import { apiFetch } from "../../lib/api";
import { Loader2, ShieldCheck } from "lucide-react";

export default function WeeklyCheckin() {
  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState("5");
  const [sleep, setSleep] = useState("5");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) {
      setError("Please provide your current weight.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/user/checkin", {
        method: "POST",
        body: JSON.stringify({
          weight: Number(weight),
          energyLevel: `Energy Level: ${energy}/10`,
          sleepQuality: `Sleep Quality: ${sleep}/10`,
          notes: notes || "No specific challenges noted.",
        }),
      });
      
      setMessage("Weekly check-in submitted successfully to your coach!");
      setWeight("");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Weekly Check-in</h2>
        <p className="text-zinc-400">Submit your weekly progress to your coach.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800 space-y-6">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Current Weight (kg)</label>
            <input 
              type="number" 
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 82.5"
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white animate-transition" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">How was your diet adherence this week? ({energy}/10)</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full accent-brand" 
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Poor (1)</span>
              <span>Perfect (10)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">How was your energy levels? ({sleep}/10)</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full accent-brand" 
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Any challenges faced this week?</label>
            <textarea 
              rows={3} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand outline-none text-white resize-none" 
              placeholder="E.g., Missed a workout due to work, struggled with cravings..."
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-brand text-black py-3 rounded-lg font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {submitting ? "Submitting Check-in..." : "Submit Check-in"}
        </button>
      </form>
    </div>
  );
}
