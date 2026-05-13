"use client";
import { CheckCircle2, AlertCircle, Info, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReasoningStep {
  step?: number;
  id?: number;
  title?: string;
  label?: string;
  description?: string;
  message?: string;
  status?: "pending" | "processing" | "done" | "error" | "correct" | "warning";
}

export default function LiveReasoningTrace({ trace, currentStep }: { trace: ReasoningStep[], currentStep: number }) {
  // Normalize trace data to handle both backend formats
  const normalizedTrace = (trace || []).map((step, idx) => ({
    step: step.step || step.id || idx + 1,
    title: step.title || step.label || `Step ${idx + 1}`,
    description: step.description || step.message || step.label || "Processing...",
    status: step.status || "done",
  }));

  // If trace is empty, show default RIMN pipeline steps
  const displayTrace = normalizedTrace.length > 0 ? normalizedTrace : [
    { step: 1, title: "Input Processing", description: "Extracting text, image, and audio modalities from submission", status: "done" },
    { step: 2, title: "Cross-Attention Fusion", description: "Recursive iterative negotiation between modalities (2 iterations)", status: "done" },
    { step: 3, title: "Final Scoring", description: "Computing confidence-weighted assessment score", status: "done" },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
        <h3 className="text-xl font-bold font-outfit text-white">Live Reasoning Trace</h3>
      </div>

      <div className="space-y-3">
        {displayTrace.map((step, idx) => {
          const isDone = step.status === "done" || step.status === "correct" || idx < currentStep;
          const isActive = idx === currentStep && step.status !== "done" && step.status !== "correct";
          const isError = step.status === "error";
          const isWarning = step.status === "warning";

          return (
            <motion.div 
              key={step.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`p-4 rounded-xl border transition-all duration-300
                ${isError ? "bg-red-500/5 border-red-500/30" :
                  isWarning ? "bg-amber-500/5 border-amber-500/30" :
                  isActive ? "bg-cyan-500/5 border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]" : 
                  isDone ? "bg-slate-900/30 border-white/5" : "bg-transparent border-white/5 opacity-40"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                    ${isError ? "bg-red-500 text-white" :
                      isWarning ? "bg-amber-500 text-black" :
                      isDone ? "bg-emerald-500 text-black font-bold" : 
                      isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-600"}`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : 
                     isError ? <AlertCircle className="w-4 h-4" /> :
                     isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-0.5
                      ${isDone ? "text-emerald-400/70" : isActive ? "text-cyan-400" : "text-slate-600"}`}>
                      {step.title}
                    </p>
                    <p className={`text-sm font-medium ${isActive ? "text-white" : isDone ? "text-slate-400" : "text-slate-500"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(0,245,255,0.8)]" />
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.2s] shadow-[0_0_5px_rgba(0,245,255,0.8)]" />
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.4s] shadow-[0_0_5px_rgba(0,245,255,0.8)]" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
