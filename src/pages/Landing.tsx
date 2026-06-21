import { Link } from "react-router-dom";
import { Activity, ArrowRight, MessageCircle, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          FitByus
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Get Your Personalized Diet Plan in 30 Seconds. Join the ultimate fitness transformation program.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <Link
            to="/login?role=client"
            className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-brand hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">Generate Free Diet Plan</h3>
            <p className="text-sm text-zinc-400 mt-2 text-center">AI-powered personalized nutrition</p>
          </Link>

          <Link
            to="/login?role=client"
            className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-brand hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">Start Transformation</h3>
            <p className="text-sm text-zinc-400 mt-2 text-center">Join our premium coaching program</p>
          </Link>

          <Link
            to="/login?role=client"
            className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-brand hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">Talk to Coach</h3>
            <p className="text-sm text-zinc-400 mt-2 text-center">Get expert guidance and support</p>
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-4">
          <Link
            to="/login?role=client"
            className="text-sm font-medium text-zinc-400 hover:text-brand flex items-center gap-1"
          >
            User Login <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-zinc-800">|</span>
          <Link
            to="/login?role=coach"
            className="text-sm font-medium text-zinc-400 hover:text-brand flex items-center gap-1"
          >
            Coach Login <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-zinc-800">|</span>
          <Link
            to="/login?role=admin"
            className="text-sm font-medium text-zinc-400 hover:text-brand flex items-center gap-1"
          >
            Admin Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
