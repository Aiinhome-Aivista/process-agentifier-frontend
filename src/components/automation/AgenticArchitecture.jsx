import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

import {

  Play,

  RotateCcw,

  Database,

  Server,

  Bot,

  Bell,

  FileCheck,

  ScrollText,

  Box,

  Network,

  Zap,

  GitBranch,

  Cpu,

  CheckCircle2,
  Activity,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { getAutomationArchitecture } from "../../services/api";


// Edge transport styling
const EDGE_STYLES = {
  "sync API": { color: "#38bdf8", dashed: false, label: "SYNC API" },
  "async event": { color: "#a78bfa", dashed: true, label: "ASYNC EVENT" },
  "DB write": { color: "#fb923c", dashed: false, label: "DB WRITE" },
  "DB read/write": { color: "#fb923c", dashed: false, label: "DB READ/WRITE" },
};

function getIcon(label = "", id = "") {
  const text = (label + " " + id).toLowerCase();
  if (text.includes("sap") || text.includes("erp") || text.includes("connector")) return Network;
  if (text.includes("agent") || text.includes("validation") || text.includes("conversion") || text.includes("handler")) return Bot;
  if (text.includes("gateway") || text.includes("kong") || text.includes("nginx")) return Server;
  if (text.includes("orchestrator") || text.includes("stateful")) return GitBranch;
  if (text.includes("redis") || text.includes("postgres") || text.includes("sql") || text.includes("db") || text.includes("database")) return Database;
  if (text.includes("kafka") || text.includes("stream") || text.includes("activity") || text.includes("event")) return Activity;
  if (text.includes("notification") || text.includes("bell") || text.includes("alert")) return Bell;
  if (text.includes("update") || text.includes("file") || text.includes("check")) return FileCheck;
  if (text.includes("audit") || text.includes("scroll") || text.includes("log")) return ScrollText;
  if (text.includes("kubernetes") || text.includes("cluster") || text.includes("box") || text.includes("container")) return Box;
  return Server;
}

function transformData(apiData) {
  const nodes = apiData.nodes || [];
  const edges = apiData.edges || [];

  const layers = [
    { id: "ingress", title: "INGRESS", accent: "#38bdf8", nodes: [] },
    { id: "orchestration", title: "ORCHESTRATION", accent: "#a78bfa", nodes: [] },
    { id: "agents", title: "AGENTS", accent: "#f472b6", nodes: [] },
    { id: "data", title: "DATA & INFRA", accent: "#fb923c", nodes: [] },
    { id: "output", title: "OUTPUT", accent: "#22c55e", nodes: [] },
  ];

  const nodeMeta = {};
  const runSequence = [];
  const processedNodes = new Set();
  const edgesByTarget = {};
  edges.forEach(e => {
    if (!edgesByTarget[e.target]) edgesByTarget[e.target] = [];
    edgesByTarget[e.target].push(e);
  });

  nodes.forEach(node => {
    const type = node.type?.toLowerCase();
    const id = node.id?.toLowerCase();
    const label = node.data?.label || "";

    // Map Layers
    let layerId = "data";
    if (type === "input" || id.includes("gateway")) layerId = "ingress";
    else if (id.includes("orchestrator")) layerId = "orchestration";
    else if (type === "agent" || label.toLowerCase().includes("agent")) layerId = "agents";
    else if (type === "output") layerId = "output";
    else if (type === "system") {
      if (id.includes("kafka") || id.includes("redis") || id.includes("postgres") || id.includes("kubernetes") || id.includes("db")) layerId = "data";
      else layerId = "ingress"; // Fallback for other system nodes
    }

    const layer = layers.find(l => l.id === layerId);
    if (layer) layer.nodes.push(node.id);

    // Map Meta
    nodeMeta[node.id] = { icon: getIcon(label, node.id) };
  });

  // Simple Run Sequence Heuristic
  const layersOrder = ["ingress", "orchestration", "agents", "data", "output"];
  layersOrder.forEach(lId => {
    const layer = layers.find(l => l.id === lId);
    layer.nodes.forEach(nodeId => {
      if (processedNodes.has(nodeId)) return;

      const incomingEdges = edgesByTarget[nodeId] || [];
      const edgeId = incomingEdges[0]?.id || null;

      runSequence.push({ node: nodeId, edge: edgeId });
      processedNodes.add(nodeId);
    });
  });

  return { workflow: apiData, layers: layers.filter(l => l.nodes.length > 0), nodeMeta, runSequence };
}



// ────────────────────────────────────────────────────────────────

// Layout: auto-position nodes inside horizontal swimlanes

// ────────────────────────────────────────────────────────────────

const LANE_HEIGHT = 170;

const LANE_PADDING_TOP = 48;

const NODE_W = 210;

const NODE_H = 84;

const CANVAS_W = 1400;



function computeLayout(layers) {
  const positions = {};
  const laneBounds = [];

  layers.forEach((layer, laneIdx) => {

    const y = laneIdx * LANE_HEIGHT + LANE_PADDING_TOP;

    const count = layer.nodes.length;

    // distribute evenly across canvas width

    const horizontalPadding = 100;

    const usable = CANVAS_W - horizontalPadding * 2;

    const step = count === 1 ? 0 : usable / (count - 1);



    layer.nodes.forEach((nodeId, i) => {

      const x = count === 1 ? CANVAS_W / 2 - NODE_W / 2 : horizontalPadding + i * step - NODE_W / 2;

      positions[nodeId] = { x, y, laneIdx };

    });



    laneBounds.push({

      id: layer.id,

      title: layer.title,

      accent: layer.accent,

      yTop: laneIdx * LANE_HEIGHT + 8,

      yBottom: (laneIdx + 1) * LANE_HEIGHT + 8,

    });

  });



  return { positions, laneBounds, canvasHeight: layers.length * LANE_HEIGHT + 32 };

}



// ────────────────────────────────────────────────────────────────

// Edge path routing (orthogonal-ish bezier, routed to avoid overlap)

// ────────────────────────────────────────────────────────────────

function getPorts(pos) {

  return {

    top: { x: pos.x + NODE_W / 2, y: pos.y },

    bottom: { x: pos.x + NODE_W / 2, y: pos.y + NODE_H },

    left: { x: pos.x, y: pos.y + NODE_H / 2 },

    right: { x: pos.x + NODE_W, y: pos.y + NODE_H / 2 },

  };

}



function buildEdgePath(edge, positions, edgeIndex, totalSameDirection) {

  const src = positions[edge.source];

  const tgt = positions[edge.target];

  if (!src || !tgt) return { d: "", mid: { x: 0, y: 0 } };



  const srcPorts = getPorts(src);

  const tgtPorts = getPorts(tgt);



  // Decide port sides based on relative position

  const verticalDiff = tgt.y - src.y;

  const horizontalDiff = tgt.x - src.x;



  let p1, p2;



  if (Math.abs(verticalDiff) > LANE_HEIGHT * 0.5) {

    // crossing lanes — use vertical ports

    if (verticalDiff > 0) {

      p1 = srcPorts.bottom;

      p2 = tgtPorts.top;

    } else {

      p1 = srcPorts.top;

      p2 = tgtPorts.bottom;

    }

  } else {

    // same lane — use horizontal ports

    if (horizontalDiff >= 0) {

      p1 = srcPorts.right;

      p2 = tgtPorts.left;

    } else {

      p1 = srcPorts.left;

      p2 = tgtPorts.right;

    }

  }



  // Offset parallel edges between same pair to avoid overlap

  const offset = (edgeIndex - (totalSameDirection - 1) / 2) * 18;



  let d;

  let mid;



  if (p1.y === srcPorts.bottom?.y || p1.y === srcPorts.top?.y) {

    // vertical routing

    const midY = (p1.y + p2.y) / 2;

    const cx1 = p1.x + offset;

    const cx2 = p2.x + offset;

    d = `M ${p1.x} ${p1.y} C ${cx1} ${midY}, ${cx2} ${midY}, ${p2.x} ${p2.y}`;

    mid = { x: (p1.x + p2.x) / 2 + offset, y: midY };

  } else {

    // horizontal routing

    const midX = (p1.x + p2.x) / 2;

    const cy1 = p1.y + offset;

    const cy2 = p2.y + offset;

    d = `M ${p1.x} ${p1.y} C ${midX} ${cy1}, ${midX} ${cy2}, ${p2.x} ${p2.y}`;

    mid = { x: midX, y: (p1.y + p2.y) / 2 + offset };

  }



  return { d, mid, p1, p2 };

}



// ────────────────────────────────────────────────────────────────

// Component

// ────────────────────────────────────────────────────────────────

export default function SapValidationWorkflow({ suggestionId }) {
  const [workflow, setWorkflow] = useState(null);
  const [layers, setLayers] = useState([]);
  const [nodeMeta, setNodeMeta] = useState({});
  const [runSequence, setRunSequence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeNodes, setActiveNodes] = useState(new Set());
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [activeEdges, setActiveEdges] = useState(new Set());
  const [completedEdges, setCompletedEdges] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [log, setLog] = useState([]);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const cancelRef = useRef(false);

  const lastFetchedId = useRef(null);

  useEffect(() => {
    if (!suggestionId || lastFetchedId.current === suggestionId) return;

    const fetchArchitecture = async () => {
      setLoading(true);
      setError(null);
      lastFetchedId.current = suggestionId;
      try {
        const data = await getAutomationArchitecture(suggestionId);
        const transformed = transformData(data);
        setWorkflow(transformed.workflow);
        setLayers(transformed.layers);
        setNodeMeta(transformed.nodeMeta);
        setRunSequence(transformed.runSequence);
      } catch (err) {
        console.error("Failed to fetch architecture:", err);
        setError(err.message);
        lastFetchedId.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchArchitecture();
  }, [suggestionId]);

  const nodesById = useMemo(() => {
    if (!workflow) return {};
    return Object.fromEntries(workflow.nodes.map((n) => [n.id, n]));
  }, [workflow]);

  const edgesById = useMemo(() => {
    if (!workflow) return {};
    return Object.fromEntries(workflow.edges.map((e) => [e.id, e]));
  }, [workflow]);

  const { positions, laneBounds, canvasHeight } = useMemo(() => {
    if (!layers.length) return { positions: {}, laneBounds: [], canvasHeight: 400 };
    return computeLayout(layers);
  }, [layers]);

  // Precompute edge paths
  const edgePaths = useMemo(() => {
    if (!workflow || !Object.keys(positions).length) return [];
    const pairCounts = {};
    workflow.edges.forEach((e) => {
      const key = `${e.source}->${e.target}`;
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    });
    const pairSeen = {};
    return workflow.edges.map((e) => {
      const key = `${e.source}->${e.target}`;
      const idx = (pairSeen[key] = (pairSeen[key] || 0) + 1) - 1;
      const total = pairCounts[key];
      const routed = buildEdgePath(e, positions, idx, total);
      return { ...e, ...routed, style: EDGE_STYLES[e.label] || EDGE_STYLES["sync API"] };
    });
  }, [workflow, positions]);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const reset = useCallback(() => {
    cancelRef.current = true;
    setActiveNodes(new Set());
    setCompletedNodes(new Set());
    setActiveEdges(new Set());
    setCompletedEdges(new Set());
    setCurrentStep(-1);
    setIsRunning(false);
    setLog([]);
  }, []);

  const runFlow = async () => {
    if (isRunning || !runSequence.length) return;
    reset();
    await new Promise((r) => setTimeout(r, 60));
    cancelRef.current = false;
    setIsRunning(true);

    const activeN = new Set();
    const completedN = new Set();
    const activeE = new Set();
    const completedE = new Set();
    const lines = [];

    for (let i = 0; i < runSequence.length; i++) {
      if (cancelRef.current) return;
      const step = runSequence[i];
      setCurrentStep(i);

      if (step.edge) {
        activeE.forEach((e) => completedE.add(e));
        activeE.clear();
        activeE.add(step.edge);
        setActiveEdges(new Set(activeE));
        setCompletedEdges(new Set(completedE));
        const e = edgesById[step.edge];
        if (e) {
          lines.push(`↳ ${e.label?.padEnd(12) || "FLOW"} ${e.source} → ${e.target}`);
          setLog([...lines]);
        }
        await wait(STEP_DELAY * 0.5);
        if (cancelRef.current) return;
      }

      activeN.forEach((n) => {
        if (n !== step.node) completedN.add(n);
      });
      activeN.clear();
      activeN.add(step.node);
      setActiveNodes(new Set(activeN));
      setCompletedNodes(new Set(completedN));

      const n = nodesById[step.node];
      if (n) {
        lines.push(`● ${n.data.label}`);
        setLog([...lines]);
      }

      await wait(STEP_DELAY);
    }

    activeN.forEach((n) => completedN.add(n));
    activeE.forEach((e) => completedE.add(e));
    setActiveNodes(new Set());
    setCompletedNodes(new Set(completedN));
    setActiveEdges(new Set());
    setCompletedEdges(new Set(completedE));
    lines.push(`◆ pipeline complete — ${runSequence.length} services validated`);
    setLog([...lines]);
    setIsRunning(false);
    setTimeout(() => setShowCompleteModal(true), 500);
  };




  const logRef = useRef(null);

  useEffect(() => {

    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });

  }, [log]);



  if (loading) {
    return (
      <div className="w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 h-[820px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
          <p className="text-sm font-medium text-slate-500">loading Architecture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 h-[820px]">
        <div className="flex flex-col items-center gap-3 text-red-500 p-8 text-center max-w-md">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">Failed to load architecture: {error}</p>
        </div>
      </div>
    );
  }

  if (!workflow || !workflow.nodes.length) {
    return (
      <div className="w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 h-[820px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Box className="w-8 h-8 opacity-20" />
          <p className="text-sm font-medium">No architecture data available for this suggestion.</p>
        </div>
      </div>
    );
  }

  const STEP_DELAY = 650;
  const hoveredNodeData = hoveredNode ? nodesById[hoveredNode] : null;



  return (
    <div
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
      className="w-full bg-white relative min-h-[860px] flex flex-col p-6"
    >
      <div className="relative h-full flex flex-col">
        {/* Header (Internal to card) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">



          <div className="flex items-center gap-3">

            <button
              onClick={reset}
              disabled={!isRunning && activeNodes.size === 0 && completedNodes.size === 0}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-400 bg-white hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-slate-600"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
              Reset
            </button>

            <button
              onClick={runFlow}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#10b981] hover:bg-[#059669] text-white shadow-xl shadow-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
            >
              <Play size={14} className="fill-current group-hover:scale-110 transition-transform" />
              {isRunning ? "Running…" : "Run the Agent"}
            </button>

          </div>

        </header>



        {/* Canvas + side panel */}

        <div className="flex flex-col gap-6">

          <div className="relative rounded-2xl border border-slate-200 bg-white/70 overflow-hidden shadow-2xl backdrop-blur-md">

            <div className="absolute top-4 right-6 text-[10px] uppercase font-black tracking-[0.25em] text-slate-400 flex items-center gap-2 z-10">
              <span
                className={`w-2 h-2 rounded-full ${isRunning ? "bg-sky-500 animate-pulse" : "bg-slate-300"
                  }`}
              />
              {isRunning ? "executing" : "idle"}
            </div>



            <svg

              viewBox={`0 0 ${CANVAS_W} ${canvasHeight}`}

              className="w-full"

              style={{ height: "min(78vh, 820px)" }}

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



              <rect width={CANVAS_W} height={canvasHeight} fill="url(#sap-dots)" opacity="0.5" />



              {/* Swimlane backgrounds */}

              {laneBounds.map((lane, i) => (

                <g key={lane.id}>

                  <rect
                    x={16}
                    y={lane.yTop}
                    width={CANVAS_W - 32}
                    height={lane.yBottom - lane.yTop - 8}
                    fill={lane.accent}
                    opacity="0.04"
                    rx="12"
                  />

                  <line

                    x1={16}

                    y1={lane.yTop}

                    x2={CANVAS_W - 16}

                    y2={lane.yTop}

                    stroke={lane.accent}

                    strokeOpacity="0.12"

                    strokeDasharray="2 6"

                  />

                  {/* lane label */}

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

              ))}



              {/* EDGES */}

              {edgePaths.map((edge) => {

                const isActive = activeEdges.has(edge.id);

                const isDone = completedEdges.has(edge.id);

                const isHovered = hoveredEdge === edge.id;

                const baseColor = edge.style.color;

                const color = isActive ? "#22c55e" : isDone ? "#16a34a" : baseColor;

                const opacity = isActive ? 1 : isDone ? 0.5 : isHovered ? 0.95 : 0.8;

                const markerKey = isActive

                  ? "arrow-active"

                  : isDone

                    ? `arrow-${edge.label.replace(/\s/g, "-")}`

                    : `arrow-${edge.label.replace(/\s/g, "-")}`;



                return (

                  <g

                    key={edge.id}

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

                        transition:

                          "stroke 0.35s ease, stroke-opacity 0.2s ease, stroke-width 0.2s ease",

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

              })}



              {/* NODES */}

              {workflow.nodes.map((node) => {

                const pos = positions[node.id];

                if (!pos) return null;

                const Icon = nodeMeta[node.id]?.icon || Server;

                const lane = layers[pos.laneIdx];

                const isActive = activeNodes.has(node.id);

                const isDone = completedNodes.has(node.id);

                const isHovered = hoveredNode === node.id;



                const accentColor = lane.accent || "#10b981";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  >
                    <foreignObject width={NODE_W} height={NODE_H} className="overflow-visible">
                      <div
                        className={`w-full h-full border-2 rounded-2xl flex items-center p-3 relative transition-all duration-500 bg-white ${isActive
                          ? "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] scale-[1.03]"
                          : isHovered
                            ? "shadow-xl -translate-y-1"
                            : "shadow-md"
                          }`}
                        style={{
                          backgroundColor: isActive ? "#f0fdf4" : `${accentColor}10`,
                          borderColor: isActive
                            ? "#22c55e"
                            : isHovered
                              ? accentColor
                              : `${accentColor}30`,
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
                          {React.createElement(Icon, { size: 22, className: "stroke-[2.5]" })}
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





              })}

            </svg>



            {/* Hover info card (for node) */}

            {hoveredNodeData && (

              <div
                className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xl p-4 pointer-events-none shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ boxShadow: "0 20px 50px -12px rgba(0,0,0,0.15)" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[10px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-full"
                    style={{
                      color: layers[positions[hoveredNodeData.id].laneIdx].accent,
                      backgroundColor:
                        layers[positions[hoveredNodeData.id].laneIdx].accent + "15",
                    }}
                  >
                    {hoveredNodeData.type}
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {hoveredNodeData.data.label}
                  </span>
                </div>
                <div className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  {hoveredNodeData.data.description}
                </div>
              </div>

            )}

          </div>



          {/* Side panel */}

          {/* Execution Log at the bottom */}
          <div className="w-full">

            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-400">
                  execution log
                </div>
                <div className="text-[10px] text-slate-400 font-mono font-bold">
                  {currentStep >= 0 ? `step ${currentStep + 1}/${runSequence.length}` : "—"}
                </div>
              </div>

              <div

                ref={logRef}

                className="h-[260px] overflow-y-auto text-[11px] font-mono space-y-1 pr-1"

                style={{ scrollbarWidth: "thin" }}

              >

                {log.length === 0 && (
                  <div className="text-slate-400 italic font-medium">
                    $ awaiting agent run…
                    <span className="inline-block w-1.5 h-3 ml-1 bg-slate-300 animate-pulse align-middle" />
                  </div>
                )}

                {log.map((line, i) => {

                  const isDone = line.startsWith("◆");

                  const isNode = line.startsWith("●");

                  const isEdge = line.startsWith("↳");

                  return (

                    <div
                      key={i}
                      className={`flex gap-2 ${isDone
                        ? "text-sky-600 font-bold"
                        : isNode
                          ? "text-slate-800 font-semibold"
                          : isEdge
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}

                      style={{ animation: "fadeSlide 0.25s ease" }}

                    >

                      <span className="text-slate-300 select-none w-5 text-right font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="flex-1 break-words whitespace-pre-wrap">{line}</span>

                    </div>

                  );

                })}

              </div>

            </div>





          </div>

        </div>

      </div>



      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCompleteModal(false)}
          />
          <div 
            className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-[300px] w-full border border-slate-100 overflow-hidden"
            style={{ animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Top Right Cross Button */}
            <button 
              onClick={() => setShowCompleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5 relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <CheckCircle2 className="w-8 h-8 text-emerald-500 relative z-10" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                Process Complete!
              </h3>
              
              <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                Execution successfully finished.
              </p>
              
            
            </div>
          </div>
        </div>
      )}
    </div>

  );

}



