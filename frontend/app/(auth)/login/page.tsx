"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [role, setRole] = useState<"student" | "teacher">(
    (searchParams.get("role") as "student" | "teacher") || "student"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (role === "student") {
      setEmail("student@rimn.ai");
      setPassword("rimnpassword123");
    } else {
      setEmail("teacher@rimn.ai");
      setPassword("rimnpassword123");
    }
  }, [role]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.access_token);
      router.push(res.data.user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong w-full max-w-md p-8 relative z-10"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "linear-gradient(135deg,#6C63FF,#3B82F6)" }}>⬡</div>
        <h1 className="text-3xl font-bold font-outfit">Welcome Back</h1>
        <p className="text-slate-400 mt-2">Sign in to your RIMN account</p>
      </div>

      <div className="flex p-1 bg-white/5 rounded-xl mb-8">
        <button 
          onClick={() => setRole("student")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
        >
          Student
        </button>
        <button 
          onClick={() => setRole("teacher")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "teacher" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
        >
          Teacher
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field" 
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field" 
            placeholder="••••••••"
          />
        </div>

        {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? "Signing in..." : `Sign In as ${role === "student" ? "Student" : "Teacher"}`}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-8">
        Don't have an account? <Link href="/register" className="text-indigo-400 hover:underline">Register here</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0F]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
