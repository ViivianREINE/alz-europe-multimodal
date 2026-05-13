"use client";
import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import MasteryRadar from "@/components/visualization/MasteryRadar";
import { analyticsApi, submissionsApi, notificationsApi, assignmentsApi } from "@/lib/api";
import { Bell, CheckCircle, Info, AlertCircle } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [analyticsRes, submissionsRes, notifsRes, assignmentsRes] = await Promise.all([
                analyticsApi.student(),
                submissionsApi.list(5, 0),
                notificationsApi.list(),
                assignmentsApi.list()
            ]);
            setAnalytics(analyticsRes.data);
            setRecentTasks(submissionsRes.data);
            setNotifications(notifsRes.data);
            setAssignments(assignmentsRes.data);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
        await notificationsApi.markRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
        console.error(err);
    }
  };

  const stats = [
    { label: "Overall Score", value: analytics ? `${analytics.average_score}%` : "0%", icon: <Zap size={18} />, color: "text-cyan-400" },
    { label: "Completed Tasks", value: analytics ? analytics.total.toString() : "0", icon: <CheckCircle2 size={18} />, color: "text-emerald-400" },
    { label: "Best Score", value: analytics ? `${analytics.best_score}%` : "0%", icon: <BarChart3 size={18} />, color: "text-indigo-400" },
    { label: "Recent Average", value: analytics?.recent?.length > 0 ? `${Math.round(analytics.recent.reduce((a:any, b:any) => a + b.score, 0) / analytics.recent.length)}%` : "N/A", icon: <Clock size={18} />, color: "text-amber-400" },
  ];

  if (loading) return (
    <SidebarLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Learning Data...</p>
        </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2">Welcome Back, {user?.full_name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 font-medium">You've completed {analytics?.total || 0} assessments. Your accuracy is {analytics?.average_score || 0}%!</p>
          </div>
          <Link href="/student/submit" className="btn-elite flex items-center gap-2">
            <Plus size={18} /> New Submission
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  {stat.icon}
                </div>
                <ArrowUpRight size={14} className="text-slate-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white font-outfit">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Recent Activity */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-outfit text-white">Recent Activity</h3>
              <Link href="/student/history" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">View All</Link>
            </div>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <Link key={task.id} href={`/student/results?id=${task.id}`} className="block">
                    <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all
                             ${task.score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 
                               task.score >= 50 ? 'bg-amber-500/10 text-amber-500' : 
                               'bg-red-500/10 text-red-500'}`}>
                        {task.score || 0}
                        </div>
                        <div>
                        <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{task.question || "Assessment"}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="uppercase tracking-widest">{task.subject || "General"}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mastery Section */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-bold font-outfit text-white">Concept Mastery</h3>
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
              <MasteryRadar data={
                analytics?.by_subject ? Object.entries(analytics.by_subject).map(([subject, score]) => ({
                    subject,
                    score: score as number,
                    fullMark: 100
                })) : [
                    { subject: "Physics", score: 0, fullMark: 100 },
                    { subject: "Chemistry", score: 0, fullMark: 100 },
                    { subject: "Biology", score: 0, fullMark: 100 }
                ]
              } />
              <div className="mt-8 text-center">
                <p className="text-sm font-medium text-slate-400">
                    Your {analytics?.best_subject || "academic"} profile is growing. 
                    <span className="text-cyan-400"> Keep submitting </span> to refine your radar map.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
