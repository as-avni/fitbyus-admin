import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, ShieldAlert, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch, setToken, setUser, getToken, getUser } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") || "client").toUpperCase();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(initialRole); // "CLIENT", "COACH", "ADMIN"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Coach Specific fields
  const [experience, setExperience] = useState("");
  const [certification, setCertification] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect
    const token = getToken();
    const currentUser = getUser();
    if (token && currentUser) {
      redirectUser(currentUser.role);
    }
  }, []);

  const redirectUser = (userRole: string) => {
    if (userRole === "CLIENT") navigate("/dashboard");
    else if (userRole === "COACH") navigate("/coach");
    else if (userRole === "ADMIN") navigate("/admin");
  };

  const handleTabChange = (selectedRole: string) => {
    setRole(selectedRole);
    setError("");
    if (selectedRole === "ADMIN") {
      setIsLogin(true); // Admin registration is not allowed on frontend
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Sign In
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setUser(data.user);
        redirectUser(data.user.role);
      } else {
        // Sign Up
        const bodyPayload: any = {
          email,
          password,
          name,
          role,
        };
        if (role === "COACH") {
          bodyPayload.coachDetails = { experience, certification };
        }

        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(bodyPayload),
        });
        setToken(data.token);
        setUser(data.user);
        redirectUser(data.user.role);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative backdrop shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
            <Activity className="w-5 h-5 text-brand" /> FitByus
          </div>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-zinc-400">
              {isLogin ? "Sign in to access your dashboard" : "Join FitByus coaching ecosystem"}
            </p>
          </div>

          {/* Role Switching Header */}
          <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
            {["CLIENT", "COACH", "ADMIN"].map((tabRole) => (
              <button
                key={tabRole}
                type="button"
                onClick={() => handleTabChange(tabRole)}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                  role === tabRole
                    ? "bg-brand text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tabRole.charAt(0) + tabRole.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-sm"
              />
            </div>

            {/* Coach Registration Specific Inputs */}
            {!isLogin && role === "COACH" && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Experience</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Certification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ACE / ISSA"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-black py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-75 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {role !== "ADMIN" && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-xs text-zinc-400 hover:text-brand font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
