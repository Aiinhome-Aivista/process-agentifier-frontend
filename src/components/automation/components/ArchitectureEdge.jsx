import React from "react";

export default function ArchitectureEdge({ 
  edge, 
  activeEdges, 
  completedEdges, 
  hoveredEdge, 
  setHoveredEdge 
}) {
  const isActive = activeEdges.has(edge.id);
  const isDone = completedEdges.has(edge.id);
  const isHovered = hoveredEdge === edge.id;
  const baseColor = edge.style.color;
  const color = isActive ? "#22c55e" : isDone ? "#16a34a" : baseColor;
  const opacity = isActive ? 1 : isDone ? 0.5 : isHovered ? 0.95 : 0.8;

  const markerKey = isActive
    ? "arrow-active"
    : `arrow-${(edge.label || "sync API").replace(/\s/g, "-")}`;

  return (
    <g
      onMouseEnter={() => setHoveredEdge(edge.id)}
      onMouseLeave={() => setHoveredEdge(null)}
      style={{ cursor: "pointer" }}
    >
      {/* hit area (invisible, wider) */}
      <path d={edge.d} fill="none" stroke="transparent" strokeWidth="14" />
      
      {/* visible path */}
      <path
        d={edge.d}
        fill="none"
        stroke={color}
        strokeWidth={isActive || isHovered ? 2.5 : 1.8}
        strokeDasharray={edge.style.dashed ? "5 4" : "none"}
        strokeOpacity={opacity}
        markerEnd={`url(#${markerKey})`}
        filter={isActive ? "url(#sap-glow)" : undefined}
        style={{
          transition: "stroke 0.35s ease, stroke-opacity 0.2s ease, stroke-width 0.2s ease",
        }}
      />

      {/* flowing dots on active */}
      {isActive && (
        <path
          d={edge.d}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="2 9"
          strokeLinecap="round"
          opacity="0.9"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-22"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* hover label */}
      {isHovered && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={edge.mid.x - 42}
            y={edge.mid.y - 10}
            width="84"
            height="20"
            rx="4"
            fill="white"
            stroke={baseColor}
            strokeOpacity="0.7"
          />
          <text
            x={edge.mid.x}
            y={edge.mid.y + 4}
            fill={baseColor}
            fontSize="9"
            fontWeight="600"
            letterSpacing="1.5"
            textAnchor="middle"
          >
            {edge.style.label}
          </text>
        </g>
      )}
    </g>
  );
}
