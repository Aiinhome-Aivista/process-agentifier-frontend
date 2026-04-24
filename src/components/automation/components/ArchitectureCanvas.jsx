import React from "react";
import { EDGE_STYLES } from "../utils/architectureHelpers";

export default function ArchitectureCanvas({ 
  viewBox, 
  height, 
  isRunning, 
  children 
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white/70 overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="absolute top-4 right-6 text-[10px] uppercase font-black tracking-[0.25em] text-slate-400 flex items-center gap-2 z-10">
        <span
          className={`w-2 h-2 rounded-full ${isRunning ? "bg-sky-500 animate-pulse" : "bg-slate-300"}`}
        />
        {isRunning ? "executing" : "idle"}
      </div>

      <svg
        viewBox={viewBox}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="sap-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#cbd5e1" />
          </pattern>

          {Object.entries(EDGE_STYLES).map(([key, s]) => (
            <marker
              key={key}
              id={`arrow-${key.replace(/\s/g, "-")}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={s.color} />
            </marker>
          ))}

          <marker
            id="arrow-idle"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>

          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>

          <filter id="sap-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#sap-dots)" opacity="0.5" />
        {children}
      </svg>
    </div>
  );
}
