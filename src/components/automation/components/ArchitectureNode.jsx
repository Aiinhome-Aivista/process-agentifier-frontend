import React from "react";

export default function ArchitectureNode({ 
  node, 
  pos, 
  icon: Icon, 
  accentColor, 
  isActive, 
  isDone, 
  isHovered, 
  setHoveredNode,
  nodeWidth,
  nodeHeight
}) {
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
    >
      <foreignObject width={nodeWidth} height={nodeHeight} className="overflow-visible">
        <div
          className={`w-full h-full border-2 rounded-2xl flex items-center p-3 relative transition-all duration-500 bg-white ${isActive
            ? "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] scale-[1.03]"
            : isHovered
              ? "shadow-xl -translate-y-1"
              : "shadow-md"
            }`}
          style={{
            backgroundColor: isActive ? "#f0fdf4" : "white",
            borderColor: isActive
              ? "#22c55e"
              : isHovered
                ? accentColor
                : `${accentColor}40`,
          }}
        >
          {/* Left accent bar */}
          <div
            className="absolute top-0 left-0 w-1.5 h-full transition-all"
            style={{ backgroundColor: accentColor }}
          />

          {/* Icon Box */}
          <div
            className={`p-2.5 rounded-xl bg-slate-50 shadow-inner shrink-0 mr-4 transition-transform ${isHovered ? "scale-110" : ""
              }`}
            style={{ color: isActive ? "#16a34a" : accentColor }}
          >
            {Icon && React.createElement(Icon, { size: 22, className: "stroke-[2.5]" })}
          </div>

          {/* Text Content */}
          <div className="flex flex-col flex-1 min-w-0 pr-1">
            <span
              className={`font-bold text-[13px] leading-tight line-clamp-2 ${isActive ? "text-slate-900" : "text-slate-800"
                }`}
            >
              {node.data.label}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mt-0.5">
              {node.type}
            </span>
          </div>

          {/* Status Indicators */}
          {isActive && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
          {isDone && !isActive && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
          )}
        </div>
      </foreignObject>
    </g>
  );
}
