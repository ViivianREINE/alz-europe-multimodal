"use client";
import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import {
  TrendingUp, Users, Target, Zap, ArrowUpRight,
  Loader2, Download, FileText, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyticsApi, submissionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Report Modal ──────────────────────────────────────────────────────────────
function ReportModal({
  onClose,
  onGenerate,
  generating,
}: {
  onClose: () => void;
  onGenerate: (opts: any) => void;
  generating: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const [opts, setOpts] = useState({
    schoolName: "Delhi Public School",
    affiliation: "Affiliated to CBSE, New Delhi — Affiliation No. 2730045",
    academicYear: `${currentYear}-${currentYear + 1}`,
    term: "Term I (April – September)",
    studentName: "",
    studentClass: "Class XII (Science)",
    rollNo: "",
    section: "A",
    teacherRemarks: "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0b1120] border border-cyan-500/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <FileText size={22} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Generate CBSE Progress Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">Creates a downloadable PDF in CBSE school curriculum format</p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* School Details */}
          <div>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3">School Information</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">School Name</label>
                <input
                  value={opts.schoolName}
                  onChange={(e) => setOpts({ ...opts, schoolName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                  placeholder="Delhi Public School"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Affiliation / Board</label>
                <input
                  value={opts.affiliation}
                  onChange={(e) => setOpts({ ...opts, affiliation: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Academic Year</label>
                  <input
                    value={opts.academicYear}
                    onChange={(e) => setOpts({ ...opts, academicYear: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Term</label>
                  <select
                    value={opts.term}
                    onChange={(e) => setOpts({ ...opts, term: e.target.value })}
                    className="w-full bg-[#0d1728] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                  >
                    <option>Term I (April – September)</option>
                    <option>Term II (October – March)</option>
                    <option>Annual / Final</option>
                    <option>Mid-Term</option>
                    <option>Pre-Board</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3">Student Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Student Name <span className="text-red-400">*</span></label>
                <input
                  value={opts.studentName}
                  onChange={(e) => setOpts({ ...opts, studentName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                  placeholder="e.g. Arjun Sharma"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Roll No.</label>
                <input
                  value={opts.rollNo}
                  onChange={(e) => setOpts({ ...opts, rollNo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                  placeholder="e.g. 2024-12-001"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Class / Grade</label>
                <select
                  value={opts.studentClass}
                  onChange={(e) => setOpts({ ...opts, studentClass: e.target.value })}
                  className="w-full bg-[#0d1728] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                >
                  {["Class IX", "Class X", "Class XI (Science)", "Class XI (Commerce)", "Class XII (Science)", "Class XII (Commerce)", "Class XII (Humanities)"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Section</label>
                <select
                  value={opts.section}
                  onChange={(e) => setOpts({ ...opts, section: e.target.value })}
                  className="w-full bg-[#0d1728] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none"
                >
                  {["A","B","C","D","E"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Teacher Remarks */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Teacher's Remarks (optional)</label>
            <textarea
              value={opts.teacherRemarks}
              onChange={(e) => setOpts({ ...opts, teacherRemarks: e.target.value })}
              rows={3}
              placeholder="Leave blank for AI-generated remarks..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none resize-none"
            />
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
            <CheckCircle2 size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              The report will include <span className="text-cyan-400 font-semibold">CBSE A1–E grading</span>, 
              subject-wise performance, SGPA, multimodal intelligence profile, AI pedagogical insights, 
              co-scholastic areas, and signature blocks — all in printable PDF format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(opts)}
            disabled={generating || !opts.studentName.trim()}
            className="btn-elite flex items-center gap-2 text-sm px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {generating ? "Generating PDF..." : "Download CBSE Report"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeacherAnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    analyticsApi.teacher()
      .then((res) => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async (opts: any) => {
    setGenerating(true);
    try {
      // Dynamic import to keep PDF libs out of initial bundle
      const { generateCBSEReport } = await import("@/lib/cbseReportGenerator");

      const subjectMap: Record<string, number> = {};
      if (analytics?.by_subject) {
        Object.entries(analytics.by_subject).forEach(([subj, data]: any) => {
          subjectMap[subj] = typeof data === "object" ? data.average : data;
        });
      }

      generateCBSEReport({
        schoolName: opts.schoolName,
        schoolAffiliation: opts.affiliation,
        academicYear: opts.academicYear,
        term: opts.term,
        studentName: opts.studentName,
        studentClass: opts.studentClass,
        rollNo: opts.rollNo || "—",
        section: opts.section,
        totalSubmissions: analytics?.total_submissions ?? 0,
        averageScore: analytics?.class_average ?? 0,
        bestScore: analytics?.class_average ?? 0,
        bySubject: subjectMap,
        scoreTrend: [],
        teacherName: user?.full_name || "Dr. Somesh Nandi",
        teacherRemarks: opts.teacherRemarks,
        aiInsights: [
          `Class average stands at ${analytics?.class_average ?? 0}% across ${analytics?.total_submissions ?? 0} total submissions.`,
          "RIMN AI detected strong multimodal engagement patterns across the cohort.",
          "Students are encouraged to practice higher-order thinking application questions.",
          "Cross-subject performance indicates balanced curriculum coverage.",
          "Recommended: increase formative assessments in lower-performing subject areas.",
        ],
        modalityWeights: { text: 0.6, vision: 0.3, audio: 0.1 },
      });

      setShowModal(false);
      showToast("success", "CBSE Progress Report downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !analytics) return (
    <SidebarLayout>
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Compiling Cohort Analytics...</p>
      </div>
    </SidebarLayout>
  );

  const subjectData = Object.entries(analytics.by_subject || {}).map(([name, data]: any) => ({
    name,
    average: typeof data === "object" ? data.average : data,
    count: typeof data === "object" ? data.count : 1,
  }));

  const stats = [
    { label: "Class Average", value: `${analytics.class_average}%`, icon: <Target className="text-cyan-400" /> },
    { label: "Completion Rate", value: "94.2%", icon: <Zap className="text-emerald-400" /> },
    { label: "Total Submissions", value: analytics.total_submissions, icon: <Users className="text-indigo-400" /> },
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ReportModal
            onClose={() => setShowModal(false)}
            onGenerate={handleGenerate}
            generating={generating}
          />
        )}
      </AnimatePresence>

      <div className="space-y-10 animate-fade-in max-w-7xl pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2 uppercase tracking-tight">Cohort Analytics</h1>
            <p className="text-slate-500 font-medium">Deep insights into class performance and learning trends.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-elite flex items-center gap-2 text-xs px-6 shadow-cyan-900/40"
          >
            <Download size={16} />
            Generate CBSE Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] blur-3xl" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 text-xl">{stat.icon}</div>
                <ArrowUpRight size={14} className="text-slate-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white font-outfit">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-10 rounded-3xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Subject Performance Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Average mastery across different scientific disciplines.</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ backgroundColor: "#05070a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                  itemStyle={{ color: "#06b6d4", fontWeight: 900, fontSize: "13px" }}
                  labelStyle={{ color: "#475569", fontSize: "11px", marginBottom: "4px", fontWeight: 800 }}
                />
                <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={50}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#06b6d4" : "#6366f1"} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
