"use client";
import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  ArrowUpRight,
  UserCheck,
  Plus,
  Loader2,
  X
} from "lucide-react";
import Link from "next/link";
import { analyticsApi, submissionsApi, assignmentsApi } from "@/lib/api";

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("Biology");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [analyticsRes, submissionsRes, assignmentsRes] = await Promise.all([
                analyticsApi.teacher(),
                submissionsApi.list(10, 0),
                assignmentsApi.list(),
            ]);
            setAnalytics(analyticsRes.data);
            setRecentSubmissions(submissionsRes.data);
            setAssignments(assignmentsRes.data);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim()) return;
    setIsCreatingAssignment(true);
    try {
      const res = await assignmentsApi.create({
        title: assignmentTitle.trim(),
        description: assignmentDescription.trim(),
        subject: assignmentSubject,
        due_date: assignmentDueDate || undefined,
      });
      setAssignments((prev) => [res.data, ...prev]);
      setIsAssignmentModalOpen(false);
      setAssignmentTitle("");
      setAssignmentSubject("Biology");
      setAssignmentDueDate("");
      setAssignmentDescription("");
    } catch (err) {
      console.error("Assignment creation failed", err);
      alert("Unable to create assignment. Please try again.");
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const classStats = [
    { label: "Class Average", value: analytics ? `${analytics.class_average}%` : "0%", icon: <TrendingUp size={18} />, color: "text-cyan-400" },
    { label: "Total Students", value: analytics ? analytics.total_submissions.toString() : "0", icon: <Users size={18} />, color: "text-emerald-400" },
    { label: "Submissions Today", value: "12", icon: <CheckCircle2 size={18} />, color: "text-cyan-400" },
    { label: "Flagged Anomalies", value: "3", icon: <AlertTriangle size={18} />, color: "text-amber-400" },
  ];

  if (loading) return (
    <SidebarLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Class Data...</p>
        </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in relative">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2 uppercase tracking-tight">Teacher Overview</h1>
            <p className="text-slate-500 font-medium tracking-tight">Monitoring Performance & Multimodal Insights for your cohorts.</p>
          </div>
          <div className="flex gap-4">
             <button className="btn-elite-outline flex items-center gap-2 text-xs">
                <Filter size={16} /> Filter Class
             </button>
             <button 
                onClick={() => setIsAssignmentModalOpen(true)}
                className="btn-elite flex items-center gap-2 shadow-cyan-900/40 text-xs"
             >
                <Plus size={18} /> Create Assignment
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {classStats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl border-white/5 hover:border-cyan-500/20 transition-all"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Submissions Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-outfit text-white">Live Submissions</h3>
              <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input type="text" placeholder="Search students..." className="bg-white/5 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs w-48 outline-none focus:border-cyan-500/30 text-white" />
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border-white/5">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                    <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task</th>
                    <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</th>
                    <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="p-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-[10px]">
                            {(sub.student_name || sub.user_name)?.split(' ').map((n:any) => n[0]).join('') || "S"}
                          </div>
                          <span className="text-sm font-semibold text-slate-200">{sub.student_name || sub.user_name || "Student"}</span>
                        </div>
                      </td>
                      <td className="p-5">
                         <p className="text-sm font-medium text-slate-300 line-clamp-1">{sub.question || "Topic Assessment"}</p>
                         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{new Date(sub.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-5">
                        <div className={`text-sm font-black font-outfit ${sub.score >= 80 ? 'text-emerald-400' : sub.score < 50 ? 'text-red-400' : 'text-cyan-400'}`}>
                          {sub.score}%
                        </div>
                      </td>
                      <td className="p-5">
                         <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                            ${sub.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                         >
                            {sub.status}
                         </span>
                      </td>
                      <td className="p-5 text-right">
                        <Link href={`/teacher/submissions/${sub.id}`} className="text-slate-600 hover:text-cyan-400 transition-colors">
                           <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-outfit text-white">Topic Performance</h3>
            <div className="glass-card p-6 rounded-2xl space-y-6">
               {analytics?.by_subject && Object.entries(analytics.by_subject).map(([topic, data]: any) => (
                 <div key={topic}>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-slate-300">{topic}</span>
                     <span className="text-[10px] font-bold text-emerald-400">
                       {data.count} submissions
                     </span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,245,255,0.5)]" style={{ width: `${data.average}%` }} />
                     </div>
                     <span className="text-xs font-mono text-slate-500">{data.average}%</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/10">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-white">Active Assignments</h3>
               </div>
               {assignments.length > 0 ? (
                 <div className="space-y-4">
                   {assignments.slice(0, 4).map((assignment) => (
                     <div key={assignment.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <div className="flex items-center justify-between gap-4">
                         <div>
                           <p className="text-sm font-bold text-white">{assignment.title}</p>
                           <p className="text-xs text-slate-400 line-clamp-2 mt-1">{assignment.description || "No description provided."}</p>
                         </div>
                         <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-500">{assignment.subject || "General"}</span>
                       </div>
                       <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
                         <span>Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No deadline"}</span>
                         <span className="text-emerald-400">Active</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-slate-500 text-sm">No assignments deployed yet. Create one for your students now.</p>
               )}
            </div>

            <div className="glass-card p-6 rounded-2xl bg-cyan-500/5 border-cyan-500/10">
               <div className="flex items-center gap-3 mb-3">
                  <UserCheck size={18} className="text-cyan-400" />
                  <h4 className="font-bold text-sm text-white">Insight of the Week</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 Students are performing 15% better in tasks with <span className="text-cyan-400 font-bold">visual diagrams</span> compared to text-only assessments. Consider adding more multimodal content to the next assignment.
               </p>
            </div>
          </div>
        </div>

        {/* Create Assignment Modal */}
        <AnimatePresence>
            {isAssignmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card w-full max-w-xl p-8 rounded-3xl border-cyan-500/20 relative"
                    >
                        <button 
                            onClick={() => setIsAssignmentModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create New Assignment</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Deploy a multimodal assessment to your class.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Assignment Title</label>
                                <input
                                  type="text"
                                  value={assignmentTitle}
                                  onChange={(e) => setAssignmentTitle(e.target.value)}
                                  placeholder="e.g. Newton's Third Law Deep Dive"
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Subject</label>
                                    <select
                                      value={assignmentSubject}
                                      onChange={(e) => setAssignmentSubject(e.target.value)}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none cursor-pointer"
                                    >
                                        <option className="bg-[#0f172a] text-white">Physics</option>
                                        <option className="bg-[#0f172a] text-white">Chemistry</option>
                                        <option className="bg-[#0f172a] text-white">Biology</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Due Date</label>
                                    <input
                                      type="date"
                                      value={assignmentDueDate}
                                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Instructions (Markdown Support)</label>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                setAssignmentDescription(text);
                                            } catch (err) {
                                                console.error("Failed to paste", err);
                                            }
                                        }}
                                        className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Paste from Clipboard
                                    </button>
                                </div>
                                <textarea
                                  value={assignmentDescription}
                                  onChange={(e) => setAssignmentDescription(e.target.value)}
                                  rows={4}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none resize-none"
                                  placeholder="Provide context or specific multimodal requirements..."
                                />
                            </div>

                            <button 
                                onClick={handleCreateAssignment}
                                disabled={isCreatingAssignment}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all uppercase tracking-widest text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCreatingAssignment ? "Deploying..." : "Deploy Assignment"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </SidebarLayout>
  );
}
