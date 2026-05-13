"use client";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Image as ImageIcon, Music } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: Record<string, string[]>;
  label?: string;
}

export default function FileUploadZone({ onFileSelect, selectedFile, accept, label }: FileUploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onFileSelect(acceptedFiles[0] || null),
    accept: accept || {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
      "audio/*": [".mp3", ".wav"],
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      {label && <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 ml-1">{label}</label>}
      
      {!selectedFile ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
            ${isDragActive ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(0,245,255,0.1)]" : "border-white/5 hover:border-cyan-500/20 bg-[#05070A]"}`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="text-slate-300 font-bold tracking-wide">Real-time Multimodal Input</p>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Drag Image, PDF, or Audio</p>
        </div>
      ) : (
        <div className="glass-card p-4 flex items-center justify-between border-cyan-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center overflow-hidden border border-white/5">
              {selectedFile.type.startsWith("image/") ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : selectedFile.type.startsWith("audio/") ? <Music className="w-6 h-6 text-cyan-400" /> :
               <FileText className="w-6 h-6 text-cyan-400" />}
            </div>
            <div>
              <p className="text-white text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-cyan-500 text-[10px] font-black uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · READY</p>
            </div>
          </div>
          <button 
            onClick={() => onFileSelect(null)}
            className="p-3 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
