import React, { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize, Maximize2, Minimize2, RefreshCw, Loader2, GitBranch, Bot, Layers, CheckCircle } from "lucide-react";
import { getProcessFlow } from "../../services/api";


/* ═══════════════════════════════════════════════════════════
   SAMPLE JSON  — replace with your real API/backend call
═══════════════════════════════════════════════════════════ */
export const sampleDiagramData = {
  title: "Process Flow Diagram",
  lanes: [],
  flow: []
};



/* ═══════════════════════════════════════════════════════════
   LAYOUT CONSTANTS
═══════════════════════════════════════════════════════════ */
const TITLE_W = 46;
const LABEL_W = 132;
const CONTENT_X = TITLE_W + LABEL_W;

const NODE_W = 260;
const NODE_H = 88;
const NODE_GAP = 80;
const LANE_H = 120;
const START_R = 20;
const DIAMOND_S = 35;

/* Dynamic column position calculator */
const getColCx = (colIndex) => {
  return 30 + (NODE_W + NODE_GAP) * colIndex + NODE_W / 2;
};

/* Helper to wrap long labels into 2 lines */
const wrapText = (text, maxLineChars = 22) => {
  if (!text) return [""];
  if (text.includes("\n")) return text.split("\n");
  if (text.length <= maxLineChars) return [text];

  const words = text.split(" ");
  let line1 = "";
  let i = 0;
  while (i < words.length && (line1 + (line1 ? " " : "") + words[i]).length <= maxLineChars) {
    line1 += (line1 ? " " : "") + words[i];
    i++;
  }
  const line2 = words.slice(i).join(" ");
  // If line2 is also very long, we might need a 3rd line, but user said "two lines"
  return line2 ? [line1, line2] : [line1];
};




/* Node colours */
const COLORS = {
  blue: "#3B82F6",    // Vibrant Blue
  green: "#10B981",   // Emerald Green
  orange: "#F97316",  // Orange
  yellow: "#EAB308",  // Yellow/Amber
  pink: "#EF4444",    // Red (matching the screenshot's 'pink' request)
};

/* ═══════════════════════════════════════════════════════════
   SVG BUILDING BLOCKS
═══════════════════════════════════════════════════════════ */
const MARKER_ID = "tip";

function Defs() {
  return (
    <defs>
      <marker id={MARKER_ID} viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#444" />
      </marker>
    </defs>
  );
}

function ProcessNode({ n, isOpen, toggleAgent, onDragStart }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const agentInfo = n.agentInfo;
  const accent = agentInfo ? (COLORS[n.color] || COLORS.pink) : COLORS.green; 
  const bg = accent + "10"; // 10% opacity
  const iconColor = agentInfo ? COLORS.green : accent; // Icon is green if agentic
  const lines = wrapText(n.label);
  const x = n.cx - NODE_W / 2;
  const y = n.cy - NODE_H / 2;

  return (
    <g
      className="node-group"
      data-node-id={n.id}
      onMouseDown={onDragStart}
    >
      {/* Soft Shadow */}
      <rect x={x + 2} y={y + 2} width={NODE_W} height={NODE_H} rx={14}
        fill="rgba(0,0,0,0.06)" />

      {/* Main Card - White base to block underlying lines */}
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={14}
        fill="#ffffff" />
      {/* Tinted Overlay */}
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={14}
        fill={bg} stroke={accent + "30"} strokeWidth={1} />

      {/* Left Accent Bar */}
      <path d={`M ${x + 8} ${y} 
                H ${x + 6} 
                A 6 6 0 0 0 ${x} ${y + 6} 
                V ${y + NODE_H - 6} 
                A 6 6 0 0 0 ${x + 6} ${y + NODE_H} 
                H ${x + 8} Z`}
        fill={accent} />

      {/* Icon Container (White Circle) */}
      <rect x={x + 18} y={n.cy - 16} width={32} height={32} rx={10}
        fill="#fff" stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />

      {/* Database/Process Icon */}
      <g transform={`translate(${x + 24}, ${n.cy - 10})`} fill="none" stroke={iconColor} strokeWidth={1.5}>
        <ellipse cx="10" cy="5" rx="7" ry="3" />
        <path d="M 3 5 v 8 c 0 1.65 3.13 3 7 3 s 7 -1.35 7 -3 v -8" />
      </g>

      {/* Text Content */}
      <g transform={`translate(${x + 62}, ${n.cy})`}>
        {lines.map((ln, i) => (
          <text key={i} x={0}
            y={(i - (lines.length - 1) / 2) * 16}
            textAnchor="start" dominantBaseline="middle"
            fill="#1F2937" fontSize={11.5} fontWeight={700}
            fontFamily="Inter, Segoe UI, sans-serif">{ln}</text>
        ))}
      </g>

      {/* Interactive Badge Area - Only if Agentic Info exists */}
      {agentInfo && (
        <foreignObject
          x={x + NODE_W - 18}
          y={y - 18}
          width={300}
          height={350}
          style={{ overflow: "visible", pointerEvents: "none", userSelect: "none" }}
        >
          <div style={{ position: "relative", pointerEvents: "all" }}>
            {/* Badge Icon */}
            <div
              className={`w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-emerald-500 transition-all duration-500 cursor-pointer hover:scale-110 active:scale-95 ${isOpen ? "rotate-90 bg-emerald-50" : ""}`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <GitBranch size={16} className="text-emerald-600 stroke-[2.5]" />
            </div>

            {/* Rich Agent Card Tooltip */}
            <div
              className={`absolute bottom-[120%] right-0 mb-4 w-72 bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden transition-all duration-500 z-[110] origin-bottom-right ${showTooltip ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4"}`}
              style={{ pointerEvents: showTooltip ? "auto" : "none" }}
            >
              {/* Card Header - Now Blue as requested */}
              <div
                className="text-white p-4 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.blue}, #2563eb)`
                }}
              >
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Bot size={20} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{agentInfo.type}</span>
                  <span className="font-extrabold text-sm tracking-tight">{agentInfo.title}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 bg-slate-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Key Tasks</span>
                </div>
                <ul className="space-y-2.5">
                  {(agentInfo.tasks || []).map((task, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
                      <span className="text-[11px] font-semibold text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tooltip Arrow */}
              <div className="absolute top-full right-4 -mt-1 border-[10px] border-transparent border-t-white" />
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

function StartNode({ n, onDragStart }) {
  return (
    <circle
      cx={n.cx} cy={n.cy} r={START_R}
      data-node-id={n.id}
      onMouseDown={onDragStart}
      className="node-group cursor-grab active:cursor-grabbing"
      fill={COLORS.pink} stroke="rgba(0,0,0,0.08)" strokeWidth={0.8} />
  );
}

function DiamondNode({ n, onDragStart }) {
  const { cx, cy } = n;
  const s = DIAMOND_S;
  return (
    <g
      data-node-id={n.id}
      onMouseDown={onDragStart}
      className="node-group cursor-grab active:cursor-grabbing"
    >
      {/* Outer Glow effect - simple approach using a larger polygon */}
      <polygon
        points={`${cx},${cy - s - 4} ${cx + s + 4},${cy} ${cx},${cy + s + 4} ${cx - s - 4},${cy}`}
        fill="rgba(234, 179, 8, 0.15)" />

      <polygon
        points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
        fill={COLORS.yellow} stroke="rgba(0,0,0,0.1)" strokeWidth={0.8} />

      <text x={cx} y={cy - s - 10} textAnchor="middle"
        fill="#1F2937" fontSize={11} fontWeight={800} fontFamily="Inter, Segoe UI, sans-serif"
        pointerEvents="none"
      >
        {n.label}
      </text>
    </g>
  );
}

function Seg({ x1, y1, x2, y2, label }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#444" strokeWidth={1.4}
        markerEnd={`url(#${MARKER_ID})`} fill="none" />
      {label && (
        <g transform={`translate(${mx}, ${my})`}>
          <rect x={-18} y={-7} width={36} height={14} rx={4} fill="#fff" />
          <text textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fontWeight={900} fill="#111" letterSpacing="0.05em">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function Elbow({ pts, label }) {
  const d = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  // Approximate midpoint for label
  const mid = pts[Math.floor(pts.length / 2)];
  return (
    <g>
      <path d={d} fill="none" stroke="#444" strokeWidth={1.4}
        markerEnd={`url(#${MARKER_ID})`} />
      {label && mid && (
        <g transform={`translate(${mid[0]}, ${mid[1]})`}>
          <rect x={-18} y={-7} width={36} height={14} rx={4} fill="#fff" />
          <text textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fontWeight={900} fill="#111" letterSpacing="0.05em">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function AgentNode({ parentNode, offset, onDragStart }) {
  const relX = offset?.x ?? (NODE_W / 2 + 50);
  const relY = offset?.y ?? -85;
  const x = parentNode.cx + relX;
  const y = parentNode.cy + relY;
  const width = 280;
  const height = 200;

  return (
    <g className="agent-group cursor-grab active:cursor-grabbing"
      data-agent-id={parentNode.id}
      onMouseDown={onDragStart}
    >
      {/* Automates Edge - Bezier curve that adjusts to agent position */}
      <path
        d={`M ${parentNode.cx + NODE_W / 2} ${parentNode.cy} 
           C ${parentNode.cx + NODE_W / 2 + 30} ${parentNode.cy}, 
             ${x + 20} ${y + height / 2 + 30}, 
             ${x + 40} ${y + 100}`}
        fill="none" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5"
        markerEnd={`url(#${MARKER_ID})`}
      />
      <g transform={`translate(${parentNode.cx + NODE_W / 2 + 35}, ${parentNode.cy + 12})`}>
        <rect x={-35} y={-8} width={70} height={16} rx={4} fill="#fff" />
        <text textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fontWeight={900} fill="#10B981" letterSpacing="1px" pointerEvents="none">
          AUTOMATES
        </text>
      </g>

      <foreignObject x={x} y={y} width={width} height={height} style={{ overflow: "visible", pointerEvents: "none" }}>
        <div className="w-[260px] bg-white border-2 border-violet-500 rounded-3xl shadow-[0_20px_50px_-12px_rgba(139,92,246,0.3)] overflow-hidden scale-90 origin-top-left animate-in zoom-in fade-in duration-500">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-4 flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Bot size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Orchestrator</span>
              <span className="font-extrabold text-sm tracking-tight leading-none">Process Agent</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50/50">
            <ul className="space-y-3">
              {(parentNode.agentInfo?.tasks || [
                "Validates sequence logic",
                "Orchestrates parallel tasks",
                "Verifies data integrity"
              ]).map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-[12px] font-bold text-slate-700 leading-tight">
                  <div className="mt-1 w-2 h-2 rounded-full bg-violet-500 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARROW RENDERER
═══════════════════════════════════════════════════════════ */
function renderArrows(flow, nm, svgW) {
  const OFFSET = 4; // Stop line slightly before border

  return flow.map((conn, i) => {
    const f = nm[conn.from];
    const t = nm[conn.to];
    if (!f || !t) return null;

    const shorten = (x1, y1, tx2, ty2, off) => {
      const dx = tx2 - x1;
      const dy = ty2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < off) return [x1, y1, tx2, ty2];
      const ratio = (len - off) / len;
      return [x1, y1, x1 + dx * ratio, y1 + dy * ratio];
    };

    const edgeLabel = conn.label || "";

    switch (conn.type) {
      /* horizontal within lane */
      case "inline": {
        const x1 = f.type === "start" ? f.cx + START_R
          : f.type === "decision" ? f.cx + DIAMOND_S
            : f.cx + NODE_W / 2;
        const tx2 = t.type === "decision" ? t.cx - DIAMOND_S
          : t.cx - NODE_W / 2;
        const [sx1, sy1, sx2, sy2] = shorten(x1, f.cy, tx2, t.cy, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} label={edgeLabel} />;
      }

      /* straight down (same column, next lane) */
      case "down": {
        const tx2 = t.cx, ty2 = t.cy - NODE_H / 2;
        const [sx1, sy1, sx2, sy2] = shorten(f.cx, f.cy + NODE_H / 2, tx2, ty2, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} label={edgeLabel} />;
      }

      /* YES — diagonal from bottom of diamond to top of target */
      case "yes": {
        const x1 = f.cx, y1 = f.cy + DIAMOND_S;
        const tx2 = t.cx, ty2 = t.cy - NODE_H / 2;
        const [sx1, sy1, sx2, sy2] = shorten(x1, y1, tx2, ty2, OFFSET);
        return (
          <g key={i}>
            <Seg x1={sx1} y1={sy1} x2={sx2} y2={sy2} />
            <text x={x1 + (tx2 - x1) * 0.3} y={y1 + (ty2 - y1) * 0.3 - 5}
              fontSize={11} fontWeight="bold" fill="#444"
              fontFamily="Segoe UI, Arial, sans-serif">{edgeLabel}</text>
          </g>
        );
      }

      /* NO — right tip of diamond → far-right wall → up → enter curd_ingredients from right */
      case "no": {
        const fx = f.cx + DIAMOND_S, fy = f.cy;
        const wallX = svgW - 18;
        const ty = t.cy;
        const tx = t.cx + NODE_W / 2;
        const [sx1, sy1, sx2, sy2] = shorten(wallX, ty, tx, ty, OFFSET);
        return (
          <g key={i}>
            <Elbow pts={[[fx, fy], [wallX, fy], [wallX, ty], [sx2, sy2]]} label={edgeLabel} />
            <text x={fx + 8} y={fy - 6} fontSize={11} fill="#444"
              fontFamily="Segoe UI, Arial, sans-serif">{edgeLabel}</text>
          </g>
        );
      }

      /* diagonal_down — straight diagonal from bottom of source to top middle of target */
      case "diagonal_down": {
        const x1 = f.cx, y1 = f.cy + NODE_H / 2;
        const tx2 = t.cx, ty2 = t.cy - NODE_H / 2;
        const [sx1, sy1, sx2, sy2] = shorten(x1, y1, tx2, ty2, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} label={edgeLabel} />;
      }

      default: return null;
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   BUILD NODE MAP
   Note: Nodes are now centered within the flow area, 
   so cx is relative to the start of the SVG.
═══════════════════════════════════════════════════════════ */
function buildNodeMap(data) {
  if (!data || !data.lanes) return {};
  const nm = {};
  data.lanes.forEach((lane, li) => {
    const cy = li * LANE_H + LANE_H / 2;
    lane.nodes.forEach(node => {
      const col = node.column ?? 1;
      nm[node.id] = { ...node, cx: getColCx(col), cy, laneIndex: li };
    });
  });
  return nm;
}


/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function SwimlaneDiagram({ data: propData, suggestionId }) {
  const [diagramData, setDiagramData] = useState(propData || sampleDiagramData);
  const [nodes, setNodes] = useState(() => buildNodeMap(diagramData));
  const [loading, setLoading] = useState(false);
  const lastFetchedId = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync internal data when propData changes
  useEffect(() => {
    if (propData) {
      setDiagramData(propData);
    }
  }, [propData]);

  // Fetch data if suggestionId is provided
  useEffect(() => {
    if (!suggestionId || lastFetchedId.current === suggestionId) return;
    setLoading(true);
    lastFetchedId.current = suggestionId;
    getProcessFlow(suggestionId)
      .then(res => {
        setDiagramData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("SwimlaneDiagram Error:", err);
        setLoading(false);
        lastFetchedId.current = null; // Allow retry
      });
  }, [suggestionId]);

  // Sync nodes when diagramData changes
  useEffect(() => {
    setNodes(buildNodeMap(diagramData));
  }, [diagramData]);




  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [draggingAgentId, setDraggingAgentId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [openAgentIds, setOpenAgentIds] = useState(new Set());
  const [agentOffsets, setAgentOffsets] = useState({}); // { parentId: { x, y } }
  const containerRef = useRef(null);

  const allNodes = Object.values(nodes);
  const laneCount = diagramData.lanes?.length || 1;
  const svgH = laneCount * LANE_H;

  // Calculate width of the flow content (SVG)
  const rightmost = allNodes.length > 0 ? Math.max(...allNodes.map(n => n.cx + NODE_W / 2)) : 500;
  const svgW = rightmost + 300;


  const BORDER = "#000000";
  const WHITE = "#ffffff";

  // --- Visibility Logic ---
  const toggleAgent = useCallback((id) => {
    setOpenAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // --- Viewport & Drag Logic ---
  const handleZoom = (factor) => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * factor, 0.4), 3)
    }));
  };

  const handleReset = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
    setNodes(buildNodeMap(diagramData));
    setAgentOffsets({});
  };


  const onMouseDown = (e) => {
    if (e.target.closest('button')) return;

    const agentId = e.target.closest('.agent-group')?.getAttribute('data-agent-id');
    const nodeId = e.target.closest('.node-group')?.getAttribute('data-node-id');

    if (agentId) {
      setDraggingAgentId(agentId);
    } else if (nodeId) {
      setDraggingNodeId(nodeId);
    } else {
      setIsPanning(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e) => {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (draggingAgentId) {
      setAgentOffsets(prev => {
        const current = prev[draggingAgentId] || { x: NODE_W / 2 + 50, y: -85 };
        return {
          ...prev,
          [draggingAgentId]: {
            x: current.x + dx / viewport.zoom,
            y: current.y + dy / viewport.zoom
          }
        };
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (draggingNodeId) {
      setNodes(prev => ({
        ...prev,
        [draggingNodeId]: {
          ...prev[draggingNodeId],
          cx: prev[draggingNodeId].cx + dx / viewport.zoom,
          cy: prev[draggingNodeId].cy + dy / viewport.zoom
        }
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isPanning) {
      setViewport(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setDraggingAgentId(null);
  };

  // --- Fullscreen Logic ---
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className={`w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 transition-all duration-300 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 tracking-tight">Loading automation workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Outer card ── */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          width: "100%",
          height: isFullscreen ? "100vh" : 600,
          background: WHITE,
          border: isFullscreen ? "none" : `1px solid ${BORDER}`,
          borderRadius: isFullscreen ? 0 : 8,
          boxShadow: isFullscreen ? "none" : "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
          overflow: "hidden",
          position: "relative",
          cursor: (isPanning || draggingNodeId || draggingAgentId) ? "grabbing" : "grab",
          transition: "height 0.3s ease",
          userSelect: "none"
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* ── Floating Controls ── */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {[
            { icon: ZoomIn, onClick: () => handleZoom(1.15), title: "Zoom In" },
            { icon: ZoomOut, onClick: () => handleZoom(0.85), title: "Zoom Out" },
            { icon: RefreshCw, onClick: handleReset, title: "Reset View" },
            { icon: isFullscreen ? Minimize2 : Maximize2, onClick: toggleFullscreen, title: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen" }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              title={btn.title}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700"
            >
              <btn.icon size={18} />
            </button>
          ))}
        </div>

        {/* ── Title Column (Far Left) ── */}
        <div style={{
          width: TITLE_W,
          background: WHITE,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          fontWeight: 700,
          fontSize: 11,
          color: "#111",
          letterSpacing: "0.05em",
          minHeight: "100%",
          padding: "20px 0",
          textTransform: "capitalize",
          zIndex: 10,
          position: "relative"
        }}>
          {diagramData.title}
        </div>


        {/* ── Main content area (Labels + Flow) ── */}
        <div style={{
          flex: 1,
          position: "relative",
          display: "flex",
          background: WHITE,
          overflow: "hidden"
        }}>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: "0 0",
              transition: (isPanning || draggingNodeId || draggingAgentId) ? "none" : "transform 0.1s ease-out"
            }}
          >
            {/* Dynamic Lane Horizontal Lines */}
            {Array.from({ length: laneCount + 1 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: i * LANE_H,
                  left: 0,
                  right: -10000,
                  height: 1,
                  backgroundColor: BORDER,
                  pointerEvents: "none",
                  opacity: 1
                }}
              />
            ))}

            <div style={{ display: "flex" }}>
              {/* ── Lane Labels Column ── */}
              <div style={{
                width: LABEL_W,
                borderRight: `1px solid ${BORDER}`,
                position: "relative",
                background: "transparent",
              }}>
                {diagramData.lanes?.map((lane) => {
                  const lines = lane.label.split("\n");
                  return (
                    <div key={lane.id} style={{
                      height: LANE_H,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 15px",
                    }}>
                      {lines.map((ln, i) => (
                        <span key={i} style={{
                          fontSize: 11,
                          lineHeight: "1.4",
                          fontWeight: 600,
                          color: "#374151",
                          textAlign: "center",
                          fontFamily: "Inter, Segoe UI, Arial, sans-serif"
                        }}>{ln}</span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* ── SVG Flow Area ── */}
              <svg width={svgW} height={svgH} style={{ background: "transparent", overflow: "visible" }}>
                <Defs />
                {renderArrows(diagramData.flow || [], nodes, svgW)}
                {/* ── Nodes (on top) ── */}
                {allNodes.map(n => {
                  const isOpen = openAgentIds.has(n.id);
                  if (n.type === "start") return <StartNode key={n.id} n={n} onDragStart={onMouseDown} />;
                  if (n.type === "decision") return <DiamondNode key={n.id} n={n} onDragStart={onMouseDown} />;
                  return (
                    <ProcessNode
                      key={n.id}
                      n={n}
                      isOpen={isOpen}
                      toggleAgent={() => toggleAgent(n.id)}
                      onDragStart={onMouseDown}
                    />
                  );
                })}

                {/* ── Agent Overlays ── */}
                {Array.from(openAgentIds).map(id => {
                  const n = nodes[id];
                  if (!n) return null;
                  return (
                    <AgentNode
                      key={`agent-${id}`}
                      parentNode={n}
                      offset={agentOffsets[id]}
                      onDragStart={(e) => onMouseDown(e)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




