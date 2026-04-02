import { X } from 'lucide-react'
import { LABELS, getExt } from './constants'

export default function FileList({ files, removeFile, userInput = '', removeText }) {
  if (files.length === 0 && !userInput.trim()) return null;
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
      {files.map(f => (
        <div key={f.name} className="flex items-center justify-between px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-md">{(LABELS[getExt(f.name)] || 'FILE').toUpperCase()}</span>
            <span className="text-sm font-bold text-white/80 truncate">{f.name}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeFile(f.name); }} 
            className="text-white/10 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      {userInput.trim() && (
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
          <div className="flex items-center gap-4 w-full">
            <span className="text-[10px] font-black px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md">TEXT</span>
            <span className="text-sm font-bold text-white/80 truncate max-w-[80%]">{userInput}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeText(); }} 
            className="text-white/10 hover:text-red-500 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
