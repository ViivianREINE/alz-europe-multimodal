"use client";
import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { History as HistoryIcon, Clock, CheckCircle2, ChevronRight, Filter, Loader2 } from "lucide-react";
import { submissionsApi } from "@/lib/api";
import Link from "next/link";

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await submissionsApi.list();
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2">My Assessments</h1>
            <p className="text-slate-500 font-medium">Review your past submissions and AI feedback.</p>
          </div>
          <button className="btn-elite-outline flex items-center gap-2 text-xs">
            <Filter size={14} /> Filter History
          </button>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading records...</p>
            </div>
        ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-white/5 rounded-3xl">
                <HistoryIcon className="mx-auto text-slate-800 mb-4" size={48} />
                <h3 className="text-white font-bold text-lg">No assessments found</h3>
                <p className="text-slate-500 text-sm mt-2">Start a new submission to see your history here.</p>
            </div>
        ) : (
            <div className="space-y-4">
            {history.map((item) => (
                <Link key={item.id} href={`/student/results/${item.id}`}>
                    <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all
                            ${item.score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 
                              item.score >= 50 ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-red-500/10 text-red-500'}`}
                        >
                            {item.score || 0}%
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{item.question || "Topic Assessment"}</h3>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            <span>{item.subject || "General"}</span>
                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                            <span>{formatDate(item.created_at)}</span>
                            </div>
                        </div>
                        </div>
                        <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full
                            ${item.status === 'done' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}
                        >
                            {item.status}
                        </span>
                        <ChevronRight size={18} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                    </div>
                </Link>
            ))}
            </div>
        )}
      </div>
    </SidebarLayout>
  );
}
