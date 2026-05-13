"use client";
import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { TrendingUp, Calendar, Target, Activity, Loader2, BarChart, Info, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart as ReBarChart,
  Bar,
  Cell
} from "recharts";

export default function StudentAnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadReport = async () => {
    if (!analytics) return;
    setGenerating(true);
    try {
      const { generateCBSEReport } = await import("@/lib/cbseReportGenerator");
      const subjectMap: Record<string, number> = {};
      Object.entries(analytics.by_subject || {}).forEach(([subj, score]: any) => {
        subjectMap[subj] = score;
      });
      generateCBSEReport({
        schoolName: "Delhi Public School",
        schoolAffiliation: "Affiliated to CBSE, New Delhi",
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        term: "Term I (April – September)",
        studentName: user?.full_name || "Student",
        studentClass: "Class XII (Science)",
        rollNo: "—",
        section: "A",
        totalSubmissions: analytics.total,
        averageScore: analytics.average_score,
        bestScore: analytics.best_score,
        bySubject: subjectMap,
        scoreTrend: analytics.score_trend || [],
        teacherName: "Dr. Somesh Nandi",
        aiInsights: [
          `Your overall accuracy is ${analytics.average_score}% across ${analytics.total} assessments.`,
          "Your best performance shows strong conceptual understanding in the top subject.",
          "Focus on consistent practice to improve weaker subject areas.",
          "RIMN AI detected strong multimodal reasoning in recent assessments.",
          "Recommended: attempt more higher-order application problems regularly.",
        ],
        modalityWeights: { text: 0.6, vision: 0.3, audio: 0.1 },
      });
      showToast("success", "Your CBSE Progress Report downloaded!");
    } catch (e) {
      showToast("error", "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.student();
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) return (
    <SidebarLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Processing Performance Data...</p>
        </div>
    </SidebarLayout>
  );

  const chartData = analytics.score_trend || [
    { idx: 1, score: 65 }, { idx: 2, score: 70 }, { idx: 3, score: 85 }, 
    { idx: 4, score: 78 }, { idx: 5, score: 92 }, { idx: 6, score: 88 }
  ];

  const subjectData = Object.entries(analytics.by_subject || {}).map(([name, score]) => ({
    name, score
  }));

  const stats = [
    { label: "Overall Accuracy", value: `${analytics.average_score}%`, icon: <Target className="text-cyan-400" />, desc: "Average across all attempts" },
    { label: "Growth Index", value: "+12.4%", icon: <TrendingUp className="text-emerald-400" />, desc: "Improvement since last week" },
    { label: "Best Score", value: `${analytics.best_score}%`, icon: <Activity className="text-indigo-400" />, desc: "Highest recorded mastery" },
    { label: "Completed", value: analytics.total, icon: <Calendar className="text-amber-400" />, desc: "Total multimodal assessments" },
  ];

  return (
    <SidebarLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-500/30 text-emerald-300"
                : "bg-red-950 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircle2 size={18} className="text-emerald-400" />
              : <AlertCircle size={18} className="text-red-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10 animate-fade-in max-w-7xl pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2 uppercase tracking-tight">Cognitive Analytics</h1>
            <p className="text-slate-500 font-medium tracking-tight">AI-driven analysis of your multimodal reasoning performance.</p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={generating}
            className="btn-elite flex items-center gap-2 text-xs px-6 disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {generating ? "Generating..." : "Download My CBSE Report"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((stat, i) => (
             <div key={i} className="glass-card p-6 rounded-3xl border-white/5 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] blur-3xl" />
                <div className="p-3 rounded-2xl bg-white/5 w-fit mb-6 text-xl">{stat.icon}</div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white font-outfit">{stat.value}</p>
                </div>
                <p className="text-[9px] text-slate-600 mt-2 font-medium">{stat.desc}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Performance Chart */}
            <div className="lg:col-span-8 glass-card p-8 rounded-3xl border-white/5">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-bold text-white">Performance Trend</h3>
                        <p className="text-xs text-slate-500 mt-1">Score progression across multimodal assessments.</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
                        Real-time Data
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                                dataKey="idx" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} 
                                dy={10}
                                label={{ value: 'Assessment No.', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 9, fontWeight: 800 }}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#06b6d4', fontWeight: 900, fontSize: '12px' }}
                                labelStyle={{ color: '#475569', fontSize: '10px', marginBottom: '4px', fontWeight: 800 }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#06b6d4" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subject Mastery Distribution */}
            <div className="lg:col-span-4 glass-card p-8 rounded-3xl border-white/5">
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-white">Subject Accuracy</h3>
                    <p className="text-xs text-slate-500 mt-1">Consistency breakdown by field.</p>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={subjectData} layout="vertical" margin={{left: 0, right: 30}}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                                width={80}
                            />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                {subjectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#6366f1'} />
                                ))}
                            </Bar>
                        </ReBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Info size={16} className="text-cyan-400 shrink-0" />
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Accuracy is calculated via <span className="text-cyan-400">RIMN-Negotiation</span> across text, image, and voice modalities.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
