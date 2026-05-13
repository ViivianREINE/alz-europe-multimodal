"use client";
import { useState, useRef, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { User, Bell, Lock, Cpu, Check, Save, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function TeacherSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [personality, setPersonality] = useState(user?.ai_personality || "Academic");
  const [depth, setDepth] = useState(user?.ai_depth || 50);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setPersonality(user.ai_personality || "Academic");
        setDepth(user.ai_depth || 50);
    }
  }, [user]);

  const sections = [
    { id: "profile", title: "Faculty Profile", icon: <User size={18} />, desc: "Name, email, and department details." },
    { id: "ai", title: "AI Grading Config", icon: <Cpu size={18} />, desc: "Modify the automated grading tone and depth." },
    { id: "notifications", title: "Alert Settings", icon: <Bell size={18} />, desc: "Control submission and anomaly notifications." },
    { id: "security", title: "Security & Privacy", icon: <Shield size={18} />, desc: "MFA and session management." },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
        const data: any = {
            ai_personality: personality,
            ai_depth: depth
        };

        if (activeSection === "profile") {
            data.full_name = nameRef.current?.value;
            data.email = emailRef.current?.value;
        }

        const res = await authApi.updateProfile(data);
        if (res.data) {
            updateUser(res.data);
            localStorage.setItem("rimn_user", JSON.stringify(res.data));
            setTimeout(() => {
                setSaving(false);
                setActiveSection(null);
            }, 800);
        }
    } catch (err) {
        console.error(err);
        setSaving(false);
        alert("Failed to update settings.");
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in max-w-4xl pb-20">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-black font-outfit text-white mb-2 uppercase tracking-tight">System Settings</h1>
                <p className="text-slate-500 font-medium">Configure your faculty environment and AI system preferences.</p>
            </div>
            {activeSection && (
                <button 
                    onClick={() => setActiveSection(null)}
                    className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-[10px] hover:text-cyan-300 transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5"
                >
                    <ArrowLeft size={14} /> Back to Menu
                </button>
            )}
        </div>

        {!activeSection ? (
            <div className="grid grid-cols-1 gap-4">
            {sections.map((sec, i) => (
                <div 
                    key={i} 
                    onClick={() => setActiveSection(sec.id)}
                    className="glass-card p-8 rounded-3xl border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.01] blur-3xl -z-10" />
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                            {sec.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{sec.title}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">{sec.desc}</p>
                        </div>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all border border-white/5">Manage</div>
                </div>
            ))}
            </div>
        ) : (
            <div className="glass-card p-10 rounded-[2.5rem] border-cyan-500/10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] -z-10" />
                
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400">
                            {sections.find(s => s.id === activeSection)?.icon}
                        </div>
                        {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                </div>

                {activeSection === "profile" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Full Name & Title</label>
                                <input ref={nameRef} type="text" defaultValue={user?.full_name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Faculty Email</label>
                                <input ref={emailRef} type="email" defaultValue={user?.email} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Department</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer font-medium">
                                <option className="bg-[#0f172a] text-white">Science Department (HOD)</option>
                                <option className="bg-[#0f172a] text-white">Physics Faculty</option>
                                <option className="bg-[#0f172a] text-white">Mathematics Faculty</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeSection === "ai" && (
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Pedagogical Personality</label>
                            <div className="grid grid-cols-3 gap-4">
                                {["Academic", "Socratic", "Concise"].map(mode => (
                                    <button 
                                        key={mode} 
                                        onClick={() => setPersonality(mode)}
                                        className={`p-6 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest
                                            ${personality === mode ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.15)]" : "border-white/5 bg-white/5 text-slate-600 hover:border-white/20"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Feedback Depth</label>
                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">{depth}% Rigor</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100"
                                value={depth}
                                onChange={(e) => setDepth(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                            />
                            <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest mt-4">
                                <span>High-Level</span>
                                <span>Standard</span>
                                <span>Exhaustive</span>
                            </div>
                        </div>
                    </div>
                )}

                {(activeSection === "notifications" || activeSection === "security") && (
                    <div className="py-24 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
                             <Check size={40} />
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Faculty protocols verified & active.</p>
                    </div>
                )}

                <div className="mt-12 pt-10 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(0,245,255,0.25)] disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "Updating Protocols..." : "Update Settings"}
                    </button>
                </div>
            </div>
        )}
      </div>
    </SidebarLayout>
  );
}
