"use client";
import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Zap, Sparkles, Brain, Lightbulb, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherInsightsPage() {
  const [applying, setApplying] = useState<number | null>(null);

  const insights = [
    { title: "Multimodal Gap", desc: "Students are struggling to link force vectors in diagrams to mathematical equations.", impact: "High", icon: <Brain className="text-amber-400" /> },
    { title: "Engagement Spike", desc: "Interactive Physics simulations increased study time by 45% this week.", impact: "Positive", icon: <TrendingUp className="text-emerald-400" /> },
    { title: "Reasoning Error", desc: "Common misconception detected: Sign convention in Newton's Third Law.", impact: "Urgent", icon: <Lightbulb className="text-cyan-400" /> },
  ];

  const handleApply = (idx: number) => {
    setApplying(idx);
    setTimeout(() => {
        setApplying(null);
        alert("AI Intervention Deployed: Suggested content will be prioritized in the next student session.");
    }, 2000);
  };

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in max-w-5xl pb-20">
        <div className="flex items-center gap-3">
           <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
             <Sparkles size={24} />
           </div>
           <div>
             <h1 className="text-4xl font-black font-outfit text-white mb-1 uppercase tracking-tight">AI Insights</h1>
             <p className="text-slate-500 font-medium">Predictive analysis and pedagogical pattern detection.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {insights.map((ins, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 rounded-3xl border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className="p-5 rounded-2xl bg-white/5 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        {ins.icon}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{ins.title}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border 
                                ${ins.impact === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                  ins.impact === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {ins.impact} Impact
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed text-sm max-w-2xl">{ins.desc}</p>
                    </div>
                    <button 
                        onClick={() => handleApply(i)}
                        disabled={applying !== null}
                        className="btn-elite flex items-center gap-2 text-[10px] px-6 py-3 shadow-cyan-900/40 whitespace-nowrap disabled:opacity-50"
                    >
                        {applying === i ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                        {applying === i ? "Deploying..." : "Apply Suggested Intervention"}
                    </button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
        </div>

        <div className="p-8 glass-card rounded-3xl border-cyan-500/10 bg-cyan-500/[0.01] flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Lightbulb size={32} />
            </div>
            <div>
                <h4 className="text-white font-bold text-xl">How it works</h4>
                <p className="text-slate-500 text-sm">Our AI monitors 50+ multimodal parameters across the entire class to detect subtle patterns in reasoning gaps before they impact grades.</p>
            </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
