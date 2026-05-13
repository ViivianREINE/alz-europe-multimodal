"use client";
import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Library, Users, Plus, ArrowRight, GraduationCap, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TeacherClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const classes = [
    { name: "Grade 11 - Physics", students: 28, lastActive: "Active Now", id: "PHY-11-B" },
    { name: "Grade 12 - Calculus", students: 24, lastActive: "2 hours ago", id: "MAT-12-A" },
    { name: "Grade 11 - Chemistry", students: 30, lastActive: "Yesterday", id: "CHM-11-C" },
  ];

  const handleCreateClass = () => {
    setCreating(true);
    setTimeout(() => {
        setCreating(false);
        setIsModalOpen(false);
        alert("Class Cohort Created Successfully!");
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in relative max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2 uppercase tracking-tight">Academic Cohorts</h1>
            <p className="text-slate-500 font-medium">Manage your active learning groups and specialized curricula.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-elite flex items-center gap-2 shadow-cyan-900/40 text-xs px-6"
          >
            <Plus size={18} /> New Class
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {classes.map((c) => (
            <Link key={c.id} href="/teacher/dashboard">
                <div className="glass-card p-10 rounded-3xl border-white/5 group hover:border-cyan-500/20 transition-all cursor-pointer flex flex-col justify-between h-[280px] relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.01] blur-3xl -z-10" />
                   <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="p-4 rounded-2xl bg-white/5 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                          <GraduationCap size={28} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${c.lastActive === 'Active Now' ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {c.lastActive}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{c.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-2">{c.students} Active Students · {c.id}</p>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 group-hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] mt-auto pt-6 border-t border-white/5">
                     Enter Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
            </Link>
          ))}
        </div>

        {/* New Class Modal */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card w-full max-w-md p-8 rounded-3xl border-cyan-500/20 relative"
                    >
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Initialize New Class</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Configure a new study cohort for the 2024-25 term.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Class Name</label>
                                <input type="text" placeholder="e.g. Class 11-C Physics" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Subject Specialization</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none cursor-pointer">
                                    <option className="bg-[#0f172a] text-white">Physics</option>
                                    <option className="bg-[#0f172a] text-white">Chemistry</option>
                                    <option className="bg-[#0f172a] text-white">Biology</option>
                                    <option className="bg-[#0f172a] text-white">Mathematics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Student Capacity</label>
                                <input type="number" placeholder="40" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none" />
                            </div>

                            <button 
                                onClick={handleCreateClass}
                                disabled={creating}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="animate-spin mx-auto" /> : "Deploy Cohort"}
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
