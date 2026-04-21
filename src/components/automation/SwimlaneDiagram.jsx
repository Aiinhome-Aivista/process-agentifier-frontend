import React from "react";

/* ═══════════════════════════════════════════════════════════
   SAMPLE JSON  — replace with your real API/backend call
═══════════════════════════════════════════════════════════ */
export const sampleDiagramData = {
  title: "Manufacture of curd",
  lanes: [
    {
      id: "admin",
      label: "Administrative\nManager",
      nodes: [
        { id: "start", type: "start", label: "", color: "pink" },
        { id: "order_pickup", type: "process", label: "Order\npickup", color: "blue" }
      ]
    },
    {
      id: "warehouse",
      label: "Warehouse",
      nodes: [
        { id: "curd_ingredients", type: "process", label: "Curd\nIngredients", color: "blue" }
      ]
    },
    {
      id: "quality",
      label: "Quality Sector",
      nodes: [
        { id: "product_analysis", type: "process", label: "Product\nanalysis", color: "blue" },
        { id: "approved_diamond", type: "decision", label: "Approved?", color: "yellow" }
      ]
    },
    {
      id: "production",
      label: "Production",
      nodes: [
        { id: "casting", type: "process", label: "Casting at\nStephan", color: "green" },
        { id: "lung_tank", type: "process", label: "Lung Tank", color: "green" },
        { id: "packaging", type: "process", label: "Packaging", color: "green" }
      ]
    },
    {
      id: "expedition",
      label: "Expedition",
      nodes: [
        { id: "label_carton", type: "process", label: "Label the carton", color: "orange" },
        { id: "expedition_node", type: "process", label: "Expedition", color: "orange" },
        { id: "transport_delivery", type: "process", label: "Transport/Delivery", color: "orange" }
      ]
    }
  ],
  flow: [
    { from: "start", to: "order_pickup", type: "inline" },
    { from: "order_pickup", to: "curd_ingredients", type: "down" },
    { from: "curd_ingredients", to: "product_analysis", type: "down" },
    { from: "product_analysis", to: "approved_diamond", type: "inline" },
    { from: "approved_diamond", to: "casting", type: "yes" },
    { from: "approved_diamond", to: "curd_ingredients", type: "no" },
    { from: "casting", to: "lung_tank", type: "inline" },
    { from: "lung_tank", to: "packaging", type: "inline" },
    { from: "packaging", to: "label_carton", type: "diagonal_down" },
    { from: "label_carton", to: "expedition_node", type: "inline" },
    { from: "expedition_node", to: "transport_delivery", type: "inline" }
  ]
};

/* ═══════════════════════════════════════════════════════════
   LAYOUT CONSTANTS
═══════════════════════════════════════════════════════════ */
const TITLE_W = 46;
const LABEL_W = 132;
const CONTENT_X = TITLE_W + LABEL_W;

const NODE_W = 118;
const NODE_H = 58;
const NODE_GAP = 56;
const LANE_H = 120; // Adjusted from 118 to fill 600px (5 lanes * 120)
const START_R = 20;
const DIAMOND_S = 32;

/* Fixed horizontal columns (relative to 0,0 of SVG, NOT including TITLE_W) */
/* Assign column index to each node (RELATIVE TO FLOW START) */
const COL_CX_FLOW = [
  30 + NODE_W / 2,                             // col 0
  30 + NODE_W + NODE_GAP + NODE_W / 2,         // col 1
  30 + (NODE_W + NODE_GAP) * 2 + NODE_W / 2,  // col 2
];

/* Assign column index to each node */
const NODE_COL_MAP = {
  start: 0,
  order_pickup: 1,
  curd_ingredients: 1,
  product_analysis: 1,
  approved_diamond: 2,
  casting: 0,
  lung_tank: 1,
  packaging: 2,
  label_carton: 0,
  expedition_node: 1,
  transport_delivery: 2,
};

/* Node colours */
const COLORS = {
  blue: "#4A90D9",
  green: "#5CB85C",
  orange: "#E8632A",
  yellow: "#F5C518",
  pink: "#E91E8C",
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

function ProcessNode({ n }) {
  const fill = COLORS[n.color] || COLORS.blue;
  const lines = n.label.split("\n");
  return (
    <g>
      <rect x={n.cx - NODE_W / 2} y={n.cy - NODE_H / 2}
        width={NODE_W} height={NODE_H} rx={9}
        fill={fill} stroke="rgba(0,0,0,0.10)" strokeWidth={0.8} />
      {lines.map((ln, i) => (
        <text key={i} x={n.cx}
          y={n.cy + (lines.length === 1 ? 0 : (i - (lines.length - 1) / 2) * 17)}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={12} fontWeight={600}
          fontFamily="Segoe UI, Arial, sans-serif">{ln}</text>
      ))}
    </g>
  );
}

function StartNode({ n }) {
  return (
    <circle cx={n.cx} cy={n.cy} r={START_R}
      fill={COLORS.pink} stroke="rgba(0,0,0,0.08)" strokeWidth={0.8} />
  );
}

function DiamondNode({ n }) {
  const { cx, cy } = n;
  const s = DIAMOND_S;
  return (
    <g>
      <polygon
        points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
        fill={COLORS.yellow} stroke="rgba(0,0,0,0.12)" strokeWidth={0.8} />
      <text x={cx} y={cy - s - 7} textAnchor="middle"
        fill="#444" fontSize={11} fontFamily="Segoe UI, Arial, sans-serif">
        Approved?
      </text>
    </g>
  );
}

function Seg({ x1, y1, x2, y2 }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#444" strokeWidth={1.6}
      markerEnd={`url(#${MARKER_ID})`} fill="none" />
  );
}

function Elbow({ pts }) {
  const d = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  return (
    <path d={d} fill="none" stroke="#444" strokeWidth={1.6}
      markerEnd={`url(#${MARKER_ID})`} />
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

    switch (conn.type) {
      /* horizontal within lane */
      case "inline": {
        const x1 = f.type === "start" ? f.cx + START_R
          : f.type === "decision" ? f.cx + DIAMOND_S
            : f.cx + NODE_W / 2;
        const tx2 = t.type === "decision" ? t.cx - DIAMOND_S
          : t.cx - NODE_W / 2;
        const [sx1, sy1, sx2, sy2] = shorten(x1, f.cy, tx2, t.cy, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} />;
      }

      /* straight down (same column, next lane) */
      case "down": {
        const tx2 = t.cx, ty2 = t.cy - NODE_H / 2;
        const [sx1, sy1, sx2, sy2] = shorten(f.cx, f.cy + NODE_H / 2, tx2, ty2, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} />;
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
              fontFamily="Segoe UI, Arial, sans-serif">YES</text>
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
            <Elbow pts={[[fx, fy], [wallX, fy], [wallX, ty], [sx2, sy2]]} />
            <text x={fx + 8} y={fy - 6} fontSize={11} fill="#444"
              fontFamily="Segoe UI, Arial, sans-serif">NO</text>
          </g>
        );
      }

      /* diagonal_down — straight diagonal from bottom of source to top middle of target */
      case "diagonal_down": {
        const x1 = f.cx, y1 = f.cy + NODE_H / 2;
        const tx2 = t.cx, ty2 = t.cy - NODE_H / 2;
        const [sx1, sy1, sx2, sy2] = shorten(x1, y1, tx2, ty2, OFFSET);
        return <Seg key={i} x1={sx1} y1={sy1} x2={sx2} y2={sy2} />;
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
  const nm = {};
  data.lanes.forEach((lane, li) => {
    const cy = li * LANE_H + LANE_H / 2;
    lane.nodes.forEach(node => {
      const col = NODE_COL_MAP[node.id] ?? 1;
      nm[node.id] = { ...node, cx: COL_CX_FLOW[col], cy, laneIndex: li };
    });
  });
  return nm;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function SwimlaneDiagram({ data = sampleDiagramData }) {
  const nm = buildNodeMap(data);
  const allNodes = Object.values(nm);
  const laneCount = data.lanes.length;
  const svgH = laneCount * LANE_H;
  
  // Calculate width of the flow content (SVG)
  const rightmost = Math.max(...allNodes.map(n => n.cx + NODE_W / 2));
  const svgW = rightmost + 100;

  const BORDER = "#000000"; 
  const WHITE = "#ffffff";

  return (
    <div className="w-full">
      {/* ── Outer card ── */}
      <div 
        style={{
          display: "flex",
          width: "100%",
          height: 600, // Matched with AgenticDeploymentFlow
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >

        {/* ── Title Column (Far Left) ── */}
        <div style={{
          width: TITLE_W,
          background: WHITE,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          // Removed rotation to match top-to-bottom reading in the Businessmap image
          fontWeight: 700,
          fontSize: 11,
          color: "#111",
          letterSpacing: "0.05em",
          minHeight: svgH,
          padding: "20px 0",
          textTransform: "capitalize",
        }}>
          {data.title}
        </div>

        {/* ── Main content area (Labels + Flow) ── */}
        <div style={{
          flex: 1,
          position: "relative",
          display: "flex",
          background: WHITE,
        }}>
          {/* Lane Horizontal Background Lines (Spanning labels + flow area) */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(to bottom, ${BORDER} 1px, transparent 1px)`,
            backgroundSize: `100% ${LANE_H}px`,
            pointerEvents: "none",
            zIndex: 0
          }} />

          {/* ── Lane Labels Column (Fixed) ── */}
          <div style={{
            width: LABEL_W,
            borderRight: `1px solid ${BORDER}`,
            position: "relative",
            zIndex: 1,
            background: "transparent", // Show lane lines through background
          }}>
            {data.lanes.map((lane) => {
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

          {/* ── SVG Flow (Centered) ── */}
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
            background: "transparent", // Show lane lines through background
          }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${svgW} ${svgH}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ display: "block", background: "transparent" }}
            >
              <Defs />
              
              {/* ── Arrows ── */}
              {renderArrows(data.flow, nm, svgW)}

              {/* ── Nodes (on top) ── */}
              {allNodes.map(n => {
                if (n.type === "start") return <StartNode key={n.id} n={n} />;
                if (n.type === "decision") return <DiamondNode key={n.id} n={n} />;
                return <ProcessNode key={n.id} n={n} />;
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}




