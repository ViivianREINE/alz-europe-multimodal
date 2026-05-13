"use client";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { History, Search, Filter, MoreVertical, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherSubmissionsPage() {
  const submissions = [
    { id: 1, student: "Arjun Sharma", task: "Physics - Newton's Laws", score: 85, status: "graded", date: "10 mins ago" },
    { id: 2, student: "Priya Singh", task: "Math - Calculus", score: 92, status: "graded", date: "25 mins ago" },
    { id: 3, student: "Rahul Verma", task: "Biology - Photosynthesis", score: 45, status: "flagged", date: "1 hour ago" },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-outfit text-white mb-2">Submissions</h1>
            <p className="text-slate-500 font-medium">Review and grade multimodal student work.</p>
          </div>
          <div className="flex gap-4">
             <button className="btn-elite-outline flex items-center gap-2 text-xs">
               <Filter size={14} /> Filter
             </button>
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
              {submissions.map((sub) => (
                <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-xs">
                        {sub.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{sub.student}</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <p className="text-sm font-medium text-slate-300">{sub.task}</p>
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{sub.date}</p>
                  </td>
                  <td className="p-5">
                    <div className={`text-sm font-black font-outfit ${sub.score >= 80 ? 'text-emerald-400' : sub.score < 50 ? 'text-red-400' : 'text-cyan-400'}`}>
                      {sub.score}%
                    </div>
                  </td>
                  <td className="p-5">
                     <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                       ${sub.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                     >
                       {sub.status}
                     </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
