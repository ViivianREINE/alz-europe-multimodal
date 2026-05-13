"use client";
import { useState, useRef, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { User, Bell, Lock, Palette, Cpu, Check, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function StudentSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Local state for interactive elements
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
    { id: "profile", title: "My Profile", icon: <User size={18} />, desc: "Name, email, and academic profile." },
    { id: "ai", title: "AI Assistant Config", icon: <Cpu size={18} />, desc: "Modify the assistant's personality and depth." },
    { id: "notifications", title: "Notification Settings", icon: <Bell size={18} />, desc: "Control when you get AI feedback alerts." },
    { id: "security", title: "Security", icon: <Lock size={18} />, desc: "Password and account protection." },
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
            
            // Show success briefly
            setTimeout(() => {
                setSaving(false);
                setActiveSection(null);
            }, 800);
        }
    } catch (err) {
        console.error(err);
        setSaving(false);
        alert("Failed to update settings. Please try again.");
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in max-w-4xl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-black font-outfit text-white mb-2">Account Settings</h1>
                <p className="text-slate-500 font-medium">Personalize your learning experience and data security.</p>
            </div>
            {activeSection && (
                <button 
                    onClick={() => setActiveSection(null)}
                    className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs hover:text-cyan-300 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Menu
                </button>
            )}
        </div>

        {!activeSection ? (
            <div className="grid grid-cols-1 gap-4">
            {sections.map((sec, i) => (
                <div 
                    key={i} 
                    onClick={() => setActiveSection(sec.id)}
                    className="glass-card p-6 rounded-2xl border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {sec.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{sec.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{sec.desc}</p>
                    </div>
                    </div>
                    <div className="px-4 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">Configure</div>
                </div>
            ))}
            </div>
        ) : (
            <div className="glass-card p-8 rounded-3xl border-cyan-500/10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10" />
                
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                            {sections.find(s => s.id === activeSection)?.icon}
                        </div>
                        {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                </div>

                {activeSection === "profile" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input ref={nameRef} type="text" defaultValue={user?.full_name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input ref={emailRef} type="email" defaultValue={user?.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 ml-1">Academic Level</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer">
                                <option className="bg-[#0f172a] text-white">Class 11 Science (CBSE)</option>
                                <option className="bg-[#0f172a] text-white">Class 12 Science (CBSE)</option>
                                <option className="bg-[#0f172a] text-white">JEE/NEET Prep</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeSection === "ai" && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 ml-1">Personality Mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["Academic", "Socratic", "Concise"].map(mode => (
                                    <button 
                                        key={mode} 
                                        onClick={() => setPersonality(mode)}
                                        className={`p-4 rounded-2xl border transition-all font-bold text-sm
                                            ${personality === mode ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.1)]" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/20"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Response Depth</label>
                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{depth}% Intensity</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100"
                                value={depth}
                                onChange={(e) => setDepth(parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                                <span>Fundamental</span>
                                <span>Intermediate</span>
                                <span>Researcher</span>
                            </div>
                        </div>
                    </div>
                )}

                {(activeSection === "notifications" || activeSection === "security") && (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
                             <Check size={32} />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Security protocols are currently optimized.</p>
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "Deploying Config..." : "Update Settings"}
                    </button>
                </div>
            </div>
        )}
      </div>
    </SidebarLayout>
  );
}
