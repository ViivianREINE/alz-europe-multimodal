"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Type, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  PlusCircle,
  BrainCircuit,
  MessageSquare,
  ChevronDown,
  Info
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import FileUploadZone from "@/components/multimodal/FileUploadZone";
import LiveReasoningTrace from "@/components/visualization/ReasoningTrace";
import AssessmentComplete from "@/components/visualization/AssessmentComplete";
import { inferenceApi } from "@/lib/api";

export default function NewSubmissionPage() {
  const [activeTab, setActiveTab] = useState<"text" | "diagram" | "voice">("text");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("Newton's Laws");
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Q&A States
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaImage, setQaImage] = useState<File | null>(null);
  const [qaResponse, setQaResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps: any = [
    { step: 1, title: "Feature Extraction", description: "Extracting multimodal features...", status: "pending" },
    { step: 2, title: "Modality Negotiation", description: "Running Cross-Attention Latent Negotiation...", status: "pending" },
    { step: 3, title: "Reasoning Evaluation", description: "Evaluating step-wise reasoning logic...", status: "pending" }
  ];

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setFile(new File([blob], "recording.webm", { type: "audio/webm" }));
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Microphone access is required for voice recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleEvaluate = async () => {
    if (!answer && !file) return;
    
    setIsEvaluating(true);
    setAssessmentResult(null);
    setQaResponse("");
    setCurrentStep(0);

    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setCurrentStep(1), 1200));
    timers.push(setTimeout(() => setCurrentStep(2), 2800));

    const formData = new FormData();
    formData.append("question", `${subject} — ${topic}`);
    formData.append("student_answer", answer || "Voice reasoning provided.");
    formData.append("subject", subject);
    formData.append("topic", topic);
    
    if (file) {
        const fieldName = file.type.startsWith("image") ? "image" : "audio";
        formData.append(fieldName, file);
    }

    try {
      const res = await inferenceApi.grade(formData);
      
      timers.push(setTimeout(() => {
        setAssessmentResult(res.data);
        setIsEvaluating(false);
        setCurrentStep(-1);
      }, 4500));
    } catch (err) {
      console.error(err);
      setIsEvaluating(false);
      setCurrentStep(-1);
      timers.forEach(clearTimeout);
    }
  };

  const handleAskQuestion = async () => {
    if (!qaQuestion) return;
    setIsAsking(true);
    setQaResponse("");

    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("question", qaQuestion);
    if (qaImage) formData.append("image", qaImage);

    try {
        const res = await (inferenceApi as any).askQuestion(formData); // Using helper
        setQaResponse(res.data.response);
    } catch (err) {
        console.error(err);
    } finally {
        setIsAsking(false);
    }
  };

  if (!mounted) return null;

  return (
    <SidebarLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto pb-20">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden border-cyan-500/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-[0_0_15px_rgba(0,245,255,0.5)]" />
            
            <div className="flex items-center gap-3 mb-8">
              <PlusCircle className="text-cyan-400" />
              <h2 className="text-2xl font-black font-outfit text-white uppercase tracking-tight">New Submission</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Select Subject</label>
                    <div className="relative">
                        <select 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:border-cyan-500/30 outline-none appearance-none cursor-pointer"
                        >
                            <option className="bg-[#0f172a] text-white">Physics</option>
                            <option className="bg-[#0f172a] text-white">Chemistry</option>
                            <option className="bg-[#0f172a] text-white">Biology</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 text-slate-600" size={14} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Specific Topic</label>
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Thermodynamics"
                        className="w-full bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:border-cyan-500/30 outline-none"
                    />
                </div>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-[#05070A] rounded-xl mb-8 w-fit border border-white/5">
              {[
                { id: "text", label: "Text", icon: <Type size={14} /> },
                { id: "diagram", label: "Diagram", icon: <ImageIcon size={14} /> },
                { id: "voice", label: "Voice", icon: <Mic size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all
                    ${activeTab === tab.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {activeTab === 'text' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Written Answer or Reasoning</label>
                  <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="E.g., The net force is 10N because..."
                    className="w-full bg-[#05070A] border border-white/5 rounded-2xl p-6 text-slate-200 placeholder:text-slate-800 focus:border-cyan-500/30 outline-none transition-all min-h-[200px] font-medium"
                  />
                </div>
              )}

              {activeTab === 'diagram' && (
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Supporting Diagram (Multimodal Feature Extraction)</label>
                   <FileUploadZone onFileSelect={setFile} selectedFile={file} />
                </div>
              )}

              {activeTab === 'voice' && (
                <div 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex flex-col items-center justify-center p-12 glass-card border-dashed rounded-2xl group transition-all cursor-pointer
                        ${isRecording ? "border-red-500/50 bg-red-500/5" : "border-cyan-500/10 hover:border-cyan-500/30"}`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all
                    ${isRecording ? "bg-red-500/20 scale-110" : "bg-cyan-500/10 group-hover:scale-110"}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all
                        ${isRecording ? "bg-red-500 shadow-red-900/40 animate-pulse" : "bg-cyan-600 shadow-cyan-900/40"}`}
                    >
                      <Mic size={24} className={isRecording ? "text-white" : "text-black"} />
                    </div>
                  </div>
                  <p className={`font-bold text-sm tracking-wide ${isRecording ? "text-red-400" : "text-slate-400"}`}>
                    {isRecording ? `Recording... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : 
                     audioBlob ? "Voice Reasoning Captured (Click to Re-record)" : "Click to record voice reasoning"}
                  </p>
                </div>
              )}

              <button 
                onClick={handleEvaluate}
                disabled={isEvaluating || (!answer && !file)}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl font-black text-black shadow-xl shadow-cyan-900/40 hover:shadow-cyan-400/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale uppercase tracking-widest"
              >
                {isEvaluating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                {isEvaluating ? "Negotiating Modalities..." : "Evaluate in Real-time"}
              </button>
            </div>
          </div>

          {/* New Q&A Module */}
          <AnimatePresence>
            {assessmentResult && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-2xl border-white/5 relative"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="text-emerald-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Ask about this topic</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea 
                                value={qaQuestion}
                                onChange={(e) => setQaQuestion(e.target.value)}
                                placeholder={`Ask anything about ${topic}...`}
                                className="w-full bg-[#05070A] border border-white/5 rounded-xl p-4 text-sm text-slate-300 focus:border-emerald-500/30 outline-none min-h-[100px]"
                            />
                            <div className="absolute bottom-4 right-4 flex gap-3">
                                <label className="cursor-pointer text-slate-600 hover:text-emerald-400 transition-colors">
                                    <ImageIcon size={18} />
                                    <input type="file" className="hidden" onChange={(e) => setQaImage(e.target.files?.[0] || null)} />
                                </label>
                                <Mic size={18} className="text-slate-600 cursor-not-allowed" />
                            </div>
                        </div>
                        {qaImage && <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-1">Image attached: {qaImage.name}</p>}
                        
                        <button 
                            onClick={handleAskQuestion}
                            disabled={isAsking || !qaQuestion}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-emerald-500/20"
                        >
                            {isAsking ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                            Get Instant Explanation
                        </button>

                        {qaResponse && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="mt-6 p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10"
                            >
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{qaResponse}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-8">
           <AnimatePresence mode="wait">
            {!assessmentResult ? (
              <motion.div 
                key="trace"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <LiveReasoningTrace trace={steps} currentStep={currentStep} />
                
                <div className="mt-6 p-6 glass-card rounded-2xl border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Info size={14} className="text-cyan-400" />
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluation Parameters</h4>
                    </div>
                    <ul className="space-y-2">
                        {["Conceptual Accuracy", "Logical Derivation", "Visual-Textual Alignment", "NCERT Standards"].map(p => (
                            <li key={p} className="text-[10px] text-slate-600 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-cyan-500" /> {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 flex justify-end">
                   <div className="badge-elite flex items-center gap-2">
                     <Sparkles size={10} /> Model: RIMN-v1 + Gemini 1.5 Flash
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <AssessmentComplete 
                  score={assessmentResult.score} 
                  breakdown={assessmentResult.reasoning_trace}
                  mastery={[
                    { topic: "Conceptual Logic", progress: assessmentResult.score },
                    { topic: "Modality Fusion", progress: Math.min(assessmentResult.score + 10, 100) }
                  ]}
                />

                {/* Methodology Disclosure */}
                <div className="glass-card p-6 rounded-2xl border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit size={16} className="text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Evaluation Methodology</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic mb-4">
                        "{assessmentResult.evaluation_summary}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {assessmentResult.evaluation_meta?.parameters?.map((p: string) => (
                            <span key={p} className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold text-slate-400 border border-white/5">{p}</span>
                        ))}
                    </div>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </SidebarLayout>
  );
}
