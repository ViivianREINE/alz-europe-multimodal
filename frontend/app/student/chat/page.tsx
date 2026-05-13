"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi, how can i assist you today" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    
    setIsTyping(true);
    
    try {
      const res = await api.post("/chat/ask", { message: userMsg });
      
      if (res.data && res.data.response) {
        setMessages(prev => [...prev, { role: "ai", content: res.data.response }]);
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "I'm having trouble connecting to the RIMN neural network. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col glass-card rounded-2xl overflow-hidden relative border-cyan-500/10 shadow-[0_0_50px_rgba(0,245,255,0.05)]">
        <div className="p-6 border-b border-white/5 bg-[#0A1128]/40 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
               <Sparkles size={20} className="animate-pulse" />
             </div>
             <div>
               <h3 className="font-black font-outfit text-white tracking-tight">AI Study Assistant</h3>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Powered by RIMN Reasoning Loop</p>
             </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 tracking-widest">SYSTEM ONLINE</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-[#020408]/30">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg
                   ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-[#0A1128] border border-white/10'}`}
                 >
                   {msg.role === 'user' ? <User size={16} className="text-black" /> : <Bot size={16} className="text-cyan-400" />}
                 </div>
                 <div className={`p-5 rounded-2xl text-sm leading-relaxed font-medium shadow-xl
                   ${msg.role === 'user' ? 'bg-cyan-600 text-black rounded-tr-none' : 'bg-[#0A1128]/80 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur-sm'}`}
                 >
                   {msg.content.split('\n').map((line, idx) => (
                     <p key={idx} className={line.startsWith('**') ? 'font-black text-white mt-2 mb-1' : 'mb-1'}>
                       {line}
                     </p>
                   ))}
                 </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0A1128] border border-white/10 flex items-center justify-center shadow-lg">
                 <Bot size={16} className="text-cyan-400" />
              </div>
              <div className="bg-[#0A1128]/40 border border-white/5 p-5 rounded-2xl rounded-tl-none">
                 <div className="flex gap-1.5">
                   {[1, 2, 3].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ y: [0, -5, 0] }}
                       transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                       className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full"
                     />
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-[#0A1128]/40 border-t border-white/5 backdrop-blur-md">
           <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative"
           >
             <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your assessment or topic..."
              className="w-full bg-[#020408]/60 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all shadow-inner placeholder:text-slate-600 font-medium"
             />
             <button 
              type="submit"
              disabled={isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 group"
             >
               <Send size={20} className="group-hover:scale-110 transition-transform" />
             </button>
           </form>
        </div>
      </div>
    </SidebarLayout>
  );
}

