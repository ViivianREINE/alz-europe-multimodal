"use client";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Library, FileText, Video, Download, ExternalLink } from "lucide-react";

export default function StudentResourcesPage() {
  const resources = [
    // Class 11
    { title: "NCERT Physics I — Class 11", type: "PDF", size: "15MB", url: "https://ncert.nic.in/textbook.php?keph1=0-8", icon: <FileText className="text-cyan-400" /> },
    { title: "NCERT Physics II — Class 11", type: "PDF", size: "14MB", url: "https://ncert.nic.in/textbook.php?keph2=0-7", icon: <FileText className="text-cyan-400" /> },
    { title: "NCERT Chemistry I — Class 11", type: "PDF", size: "16MB", url: "https://ncert.nic.in/textbook.php?kech1=0-7", icon: <FileText className="text-emerald-400" /> },
    { title: "NCERT Chemistry II — Class 11", type: "PDF", size: "13MB", url: "https://ncert.nic.in/textbook.php?kech2=0-7", icon: <FileText className="text-emerald-400" /> },
    { title: "NCERT Biology — Class 11", type: "PDF", size: "22MB", url: "https://ncert.nic.in/textbook.php?kebo1=0-22", icon: <FileText className="text-indigo-400" /> },
    
    // Class 12
    { title: "NCERT Physics I — Class 12", type: "PDF", size: "18MB", url: "https://ncert.nic.in/textbook.php?leph1=0-8", icon: <FileText className="text-cyan-400" /> },
    { title: "NCERT Physics II — Class 12", type: "PDF", size: "17MB", url: "https://ncert.nic.in/textbook.php?leph2=0-7", icon: <FileText className="text-cyan-400" /> },
    { title: "NCERT Chemistry I — Class 12", type: "PDF", size: "19MB", url: "https://ncert.nic.in/textbook.php?lech1=0-9", icon: <FileText className="text-emerald-400" /> },
    { title: "NCERT Chemistry II — Class 12", type: "PDF", size: "15MB", url: "https://ncert.nic.in/textbook.php?lech2=0-7", icon: <FileText className="text-emerald-400" /> },
    { title: "NCERT Biology — Class 12", type: "PDF", size: "24MB", url: "https://ncert.nic.in/textbook.php?lebo1=0-16", icon: <FileText className="text-indigo-400" /> },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-10 animate-fade-in max-w-5xl">
        <div className="flex items-center gap-3">
           <div className="p-3 rounded-2xl bg-white/5 text-cyan-400">
             <Library size={24} />
           </div>
           <div>
             <h1 className="text-4xl font-black font-outfit text-white mb-1">Resources</h1>
             <p className="text-slate-500 font-medium tracking-tight">Curated study materials and multimodal learning assets.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {resources.map((res, i) => (
             <a 
              key={i} 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-6 rounded-2xl border-white/5 hover:border-cyan-500/20 transition-all group cursor-pointer block"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {res.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{res.title}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{res.type} · {res.size}</p>
                      </div>
                   </div>
                   <div className="p-2 rounded-lg bg-white/5 text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <Download size={18} />
                   </div>
                </div>
             </a>
           ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
