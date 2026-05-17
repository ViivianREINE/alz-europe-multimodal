"use client";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight } from "lucide-react";

interface StepBreakdown {
  id: number;
  label: string;
  status: "correct" | "minor-error" | "incorrect";
  message: string;
}

interface MasteryUpdate {
  topic: string;
  progress: number;
}

export default function AssessmentComplete({ 
  score, 
  breakdown, 
  mastery, 
  feedback,
  evaluationSummary,
}: { 
  score: number, 
  breakdown: StepBreakdown[], 
  mastery: MasteryUpdate[],
  feedback?: string,
  evaluationSummary?: string,
}) {
  return (
    <div className="glass-card p-8 rounded-2xl space-y-6 animate-fade-in border-cyan-500/10">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-2xl font-bold font-outfit text-white">Assessment Complete</h3>
          {feedback && (
            <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-2xl">
              {feedback}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Final Score</p>
          <div className="text-4xl font-black text-cyan-500 font-outfit shadow-cyan-500/20 drop-shadow-lg">{score}%</div>
        </div>
      </div>
      {evaluationSummary && (
        <div className="rounded-2xl bg-[#07111f] border border-white/5 p-4 text-sm text-slate-300">
          {evaluationSummary}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Step-wise Breakdown</p>
        <div className="space-y-3">
          {breakdown.map((step, idx) => (
            <div key={step.id || idx} className="bg-[#05070A]/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-[#0A1128]/50 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-600">Step {step.id || idx + 1}</span>
                <span className="text-sm font-bold text-slate-200">{step.label || (step as any).description}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                ${step.status === 'correct' ? 'bg-emerald-500/10 text-emerald-400' : 
                  step.status === 'minor-error' ? 'bg-amber-500/10 text-amber-400' : 
                  step.status === 'incorrect' ? 'bg-red-500/10 text-red-400' :
                  'bg-white/5 text-slate-500'}`}
              >
                {step.status?.replace('-', ' ') || 'Complete'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Concept Mastery Updates</p>
        <div className="grid grid-cols-2 gap-4">
          {mastery.map((m) => (
            <div key={m.topic} className="bg-[#05070A]/50 border border-white/5 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-300">{m.topic}</span>
                <span className="text-[10px] font-bold text-slate-500">{m.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,245,255,0.5)]" 
                  style={{ width: `${m.progress}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
