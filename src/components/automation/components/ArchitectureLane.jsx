import React from "react";

export default function ArchitectureLane({ lane, canvasWidth }) {
  return (
    <g>
      <rect
        x={16}
        y={lane.yTop}
        width={canvasWidth - 32}
        height={lane.yBottom - lane.yTop - 8}
        fill={lane.accent}
        opacity="0.04"
        rx="12"
      />
      <line
        x1={16}
        y1={lane.yTop}
        x2={canvasWidth - 16}
        y2={lane.yTop}
        stroke={lane.accent}
        strokeOpacity="0.12"
        strokeDasharray="2 6"
      />
      <g>
        <rect
          x={24}
          y={lane.yTop + 10}
          width={140}
          height={26}
          rx="8"
          fill="black"
          stroke="#cbd5e1"
          strokeOpacity="0.8"
          className="shadow-sm"
        />
        <text
          x={94}
          y={lane.yTop + 27}
          fill="white"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2.5"
          textAnchor="middle"
          opacity="0.9"
        >
          {lane.title}
        </text>
      </g>
    </g>
  );
}
