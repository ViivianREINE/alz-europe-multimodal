"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Zap, 
  Shield, 
  BarChart, 
  Layers, 
  Cpu, 
  Globe, 
  ChevronRight,
  Sparkles,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function EliteLandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const features = [
    { 
      title: "Multimodal Negotiation", 
      desc: "Recursive cross-attention loops negotiate representations between text, vision, and audio.", 
      icon: <Zap className="text-cyan-500" /> 
    },
    { 
      title: "Step-wise Assessment", 
      desc: "Beyond binary grading. RIMN evaluates every step of a student's reasoning trace.", 
      icon: <BarChart className="text-[#39FF14]" /> 
    },
    { 
      title: "Explainable AI", 
      desc: "Human-readable feedback generated from internal latent space transitions.", 
      icon: <Cpu className="text-cyan-400" /> 
    },
    { 
      title: "Contradiction Logic", 
      desc: "Detects logical fallacies by cross-referencing visual evidence with textual claims.", 
      icon: <Shield className="text-[#39FF14]" /> 
    }
  ];

  return (
    <div className="bg-[#020408] overflow-x-hidden selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full h-20 glass-nav z-50 px-10 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-2xl font-bold transition-transform group-hover:rotate-12 shadow-[0_0_15px_rgba(0,245,255,0.5)]">
            ⬡
          </div>
          <div>
            <h1 className="text-2xl font-black font-outfit tracking-tighter">RIMN</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] -mt-1">Recursive Iterative</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Architecture</a>
          <a href="#benchmarks" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Benchmarks</a>
          <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Research</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-6 py-2">
            Sign In
          </Link>
          <Link href="/login?role=student" className="btn-elite">
            Get Started <ChevronRight size={16} className="inline ml-1" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6">
        {/* Abstract Background Glows */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#39FF14]/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          style={{ opacity, scale, y }}
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Learning Lynx · Team 39 · RVCE</span>
          </motion.div>

          <h1 className="text-7xl md:text-8xl font-black font-outfit tracking-tighter mb-8 leading-[0.9]">
            <span className="text-white">Unified</span><br />
            <span className="heading-gradient">Multimodal AI.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            The Recursive Iterative Modality Negotiation Network (RIMN). <br /> 
            A NeurIPS-grade architecture for advanced educational assessment.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login?role=student" className="px-10 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 group">
              Try as Student <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login?role=teacher" className="px-10 py-4 glass-card border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all">
              Teacher Portal
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "91.3%", label: "ScienceQA Acc." },
              { val: "6", label: "Modalities" },
              { val: "< 50ms", label: "Latent Negotiation" },
              { val: "18M", label: "Active Parameters" }
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-white font-outfit">{stat.val}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-20 text-center">
          <h2 className="text-4xl font-black font-outfit text-white mb-4">Core Architecture</h2>
          <div className="h-1 w-20 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={f.title}
              whileHover={{ y: -5 }}
              className="glass-card p-10 rounded-3xl group transition-all hover:bg-white/[0.03]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-cyan-600/10 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold font-outfit text-white mb-4">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold">⬡</div>
             <span className="font-bold text-lg">RIMN</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            © 2026 Learning Lynx · RV College of Engineering · Mentor: Dr. Prof. Somesh Nandi
          </div>
          <div className="flex gap-8">
             <a href="#" className="text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Paper</a>
             <a href="#" className="text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Github</a>
             <a href="#" className="text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
