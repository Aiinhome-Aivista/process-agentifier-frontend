import React from "react";
import { RotateCcw, Play } from "lucide-react";

export default function ArchitectureHeader({ isRunning, activeNodes, completedNodes, onReset, onRun }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          disabled={!isRunning && activeNodes.size === 0 && completedNodes.size === 0}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-400 bg-white hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-slate-600"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
          Reset
        </button>

        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#10b981] hover:bg-[#059669] text-white shadow-xl shadow-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
        >
          <Play size={14} className="fill-current group-hover:scale-110 transition-transform" />
          {isRunning ? "Running…" : "Run the Agent"}
        </button>
      </div>
    </header>
  );
}
