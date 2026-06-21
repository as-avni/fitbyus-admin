import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { apiFetch } from "../../lib/api";

export default function ProgressTracker() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckins() {
      try {
        const data = await apiFetch("/user/checkins");
        // Sort checkins chronologically for the chart
        const sorted = data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setCheckIns(sorted);
      } catch (err) {
        console.error("Failed to fetch check-ins:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCheckins();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Progress Logs...
      </div>
    );
  }

  // Format data for chart
  const progressData = checkIns.map((ci, idx) => ({
    name: new Date(ci.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: ci.weight,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Progress Tracker</h2>
        <p className="text-zinc-400">Visualize your transformation journey.</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800 h-80">
        <h3 className="font-semibold text-white mb-4">Weight Trend</h3>
        {progressData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
            <Sparkles className="w-8 h-8 text-brand/40" />
            <p className="text-sm">No progress records found. Log your first check-in to see your chart!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#fff' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#f9c126" strokeWidth={3} dot={{r: 4, fill: '#f9c126', strokeWidth: 2, stroke: '#18181b'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Progress Photos</h3>
            <button className="text-sm text-brand font-medium hover:text-brand-hover flex items-center gap-1">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-600 text-sm border border-dashed border-zinc-800">
              Before photo
            </div>
            <div className="aspect-[3/4] bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-600 text-sm border border-dashed border-zinc-800">
              Current photo
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800">
          <h3 className="font-semibold text-white mb-4">Body Measurements</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-zinc-400">Chest</span>
              <span className="font-medium text-white">102 cm</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-zinc-400">Waist</span>
              <span className="font-medium text-white">86 cm</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-zinc-400">Arms</span>
              <span className="font-medium text-white">38 cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
