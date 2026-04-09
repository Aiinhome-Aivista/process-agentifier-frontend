import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserCircle, XCircle, Database, Layers, BarChart, CheckSquare, Archive, RefreshCw, ShoppingCart, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getProcessFlow } from '../../services/api';

const ICON_MAP = {
  UserCircle,
  XCircle,
  Database,
  Layers,
  BarChart,
  CheckSquare,
  Archive,
  RefreshCw,
  ShoppingCart,
  CheckCircle
};

const STEP_TYPE_ACCENT = {
  'higher agentic intervention': '#10b981',
  'human + ai intervention': '#f59e0b',
  'higher human intervention': '#ef4444',
};

function getStepAccent(stepType = '') {
  return STEP_TYPE_ACCENT[stepType.toLowerCase()] || '#10b981';
}

function toDisplayEdgeLabel(label = '') {
  const text = label.toLowerCase().trim();
  if (text === 'conditionally leads to') return 'CONDITIONAL';
  return text.toUpperCase();
}

function getEdgeStyle(label = '') {
  const text = label.toLowerCase();
  if (text.includes('failed')) {
    return {
      stroke: '#ef4444',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      labelColor: '#ef4444',
      animated: true,
    };
  }
  if (text.includes('valid') || text.includes('approve') || text.includes('yes')) {
    return {
      stroke: '#10b981',
      strokeWidth: 2,
      labelColor: '#10b981',
      animated: true,
    };
  }
  if (text.includes('conditionally')) {
    return {
      stroke: '#f59e0b',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      labelColor: '#f59e0b',
      animated: true,
    };
  }
  if (text.includes('automates')) {
    return {
      stroke: '#8b5cf6',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      labelColor: '#8b5cf6',
      animated: true,
    };
  }
  return {
    stroke: '#4b5563',
    strokeWidth: 2,
    labelColor: '#4b5563',
    animated: true,
  };
}

function transformFlowData(apiData) {
  const rawNodes = Array.isArray(apiData?.nodes) ? apiData.nodes : [];
  const rawEdges = Array.isArray(apiData?.edges) ? apiData.edges : [];

  const groupNodes = rawNodes.filter((n) => n.type === 'agentGroupNode');
  const stepNodes = rawNodes.filter((n) => n.id?.startsWith('step-'));
  const agentNodes = rawNodes.filter((n) => n.type === 'agentNode');

  const stepById = new Map(stepNodes.map((n) => [n.id, n]));

  // Convert decision-like process nodes to diamond nodes.
  const decisionIds = new Set(
    stepNodes
      .filter((n) => (n.data?.label || '').toLowerCase().includes('decision'))
      .map((n) => n.id)
  );

  // Compute outgoing edges by source for handle/branch mapping.
  const outgoingBySource = new Map();
  rawEdges.forEach((e) => {
    const list = outgoingBySource.get(e.source) || [];
    list.push(e);
    outgoingBySource.set(e.source, list);
  });

  // Compute group order from first appearance in process steps.
  const orderedGroupIds = [];
  const seenGroups = new Set();
  stepNodes.forEach((n) => {
    if (n.parentNode && !seenGroups.has(n.parentNode)) {
      seenGroups.add(n.parentNode);
      orderedGroupIds.push(n.parentNode);
    }
  });

  groupNodes.forEach((g) => {
    if (!seenGroups.has(g.id)) {
      seenGroups.add(g.id);
      orderedGroupIds.push(g.id);
    }
  });

  const groupIndexById = new Map(orderedGroupIds.map((id, idx) => [id, idx]));

  const mappedGroups = groupNodes.map((group) => {
    const children = stepNodes.filter((n) => n.parentNode === group.id);
    const childCount = Math.max(children.length, 1);
    const index = groupIndexById.get(group.id) || 0;
    const width = 320;
    const height = Math.max(220, 110 + childCount * 95);
    return {
      ...group,
      data: {
        ...group.data,
        icon: ICON_MAP[group.data?.icon] || Database,
      },
      position: {
        x: index * 360,
        y: 140,
      },
      style: { width, height, ...group.style },
    };
  });

  // Place child process nodes inside their parent group.
  const childIndexByGroup = new Map();
  const mappedSteps = stepNodes.map((node) => {
    const current = childIndexByGroup.get(node.parentNode) || 0;
    childIndexByGroup.set(node.parentNode, current + 1);

    const isDecision = decisionIds.has(node.id);
    return {
      ...node,
      type: isDecision ? 'decisionNode' : 'processNode',
      data: isDecision
        ? {
            label: node.data?.label || 'Decision',
          }
        : {
            ...node.data,
            label: node.data?.label || 'Process Step',
            icon: ICON_MAP[node.data?.icon] || Database,
            accentColor: getStepAccent(node.data?.stepType),
          },
      parentNode: node.parentNode,
      extent: 'parent',
      position: {
        x: 24,
        y: 66 + current * 92,
      },
    };
  });

  // Position suggested agent nodes close to the group of their target step.
  const mappedAgents = agentNodes.map((node, index) => {
    const edgeFromAgent = rawEdges.find((e) => e.source === node.id && stepById.has(e.target));
    const targetStep = edgeFromAgent ? stepById.get(edgeFromAgent.target) : null;
    const targetGroupIdx = targetStep ? (groupIndexById.get(targetStep.parentNode) || 0) : index;
    return {
      ...node,
      type: 'agentNode',
      data: {
        ...node.data,
        icon: ICON_MAP[node.data?.icon] || UserCircle,
        title: node.data?.title || 'Automation Agent',
        tasks: (node.data?.tasks || []).filter(Boolean).length ? node.data.tasks.filter(Boolean) : ['Automates related process steps'],
        accentColor: '#8b5cf6',
      },
      position: {
        x: targetGroupIdx * 360 + 360,
        y: 24 + index * 120,
      },
    };
  });

  const conditionalBranchIndex = new Map();
  const mappedEdges = rawEdges.map((edge) => {
    const styleMeta = getEdgeStyle(edge.label);
    const result = {
      ...edge,
      type: 'smoothstep',
      animated: styleMeta.animated,
      label: toDisplayEdgeLabel(edge.label),
      labelStyle: { fill: styleMeta.labelColor, fontWeight: 800, fontSize: 10 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
      markerEnd: { type: MarkerType.ArrowClosed, color: styleMeta.stroke },
      style: {
        stroke: styleMeta.stroke,
        strokeWidth: styleMeta.strokeWidth,
        ...(styleMeta.strokeDasharray ? { strokeDasharray: styleMeta.strokeDasharray } : {}),
      },
    };

    if (decisionIds.has(edge.source) && edge.label?.toLowerCase().includes('conditionally')) {
      const idx = conditionalBranchIndex.get(edge.source) || 0;
      conditionalBranchIndex.set(edge.source, idx + 1);
      result.sourceHandle = idx === 0 ? 'top' : 'bottom';
      result.label = idx === 0 ? 'YES' : 'NO / PARTIAL';
      result.style = {
        ...result.style,
        stroke: idx === 0 ? '#10b981' : '#ef4444',
        ...(idx === 1 ? { strokeDasharray: '5,5' } : {}),
      };
      result.markerEnd = { type: MarkerType.ArrowClosed, color: idx === 0 ? '#10b981' : '#ef4444' };
      result.labelStyle = {
        fill: idx === 0 ? '#10b981' : '#ef4444',
        fontWeight: 800,
        fontSize: 10,
      };
    }

    return result;
  });

  return {
    nodes: [...mappedGroups, ...mappedSteps, ...mappedAgents],
    edges: mappedEdges,
  };
}

// --- Custom Nodes ---

function AgentNode({ data }) {
  const accentColor = data.accentColor || '#10b981';
  return (
    <div
      className="bg-white border rounded-xl shadow-xl w-64 overflow-hidden ring-1 ring-slate-200"
      style={{ borderColor: `${accentColor}40` }} // 40 is hex for 25% opacity
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 border-none" style={{ backgroundColor: accentColor }} />
      <div
        className="text-white p-3 flex items-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        {data.icon && <data.icon size={20} className="stroke-[2.5]" />}
        <span className="font-extrabold text-[10px] uppercase tracking-widest">{data.title}</span>
      </div>
      <div className="p-4 bg-slate-50">
        <ul className="space-y-3">
          {data.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
              <div
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{ backgroundColor: accentColor }}
              />
              {task}
            </li>
          ))}
        </ul>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 border-none" style={{ backgroundColor: accentColor }} />
    </div>
  );
}

function ProcessNode({ data }) {
  const accentColor = data.accentColor || '#10b981';
  return (
    <div
      className="bg-white border rounded-xl shadow-lg p-3.5 flex items-center gap-3.5 min-w-[200px] transition-all duration-300 group"
      style={{ borderColor: `${accentColor}60` }} // 60 is hex for 37% opacity
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-300 border-none" />
      {data.icon && (
        <div style={{ color: accentColor }}>
          <data.icon size={20} className="stroke-[2.5]" />
        </div>
      )}
      <span className="font-bold text-xs text-slate-800 tracking-wide">{data.label}</span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-300 border-none" />
    </div>
  );
}

function DecisionNode({ data }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <div className="absolute inset-0 bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] transform rotate-45 rounded-xl"></div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 z-20 !bg-amber-500 border-none" />
      <div className="relative z-10 text-center text-[10px] font-black uppercase tracking-wider text-amber-900 px-2 leading-tight">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 z-20 !bg-amber-500 border-none" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 z-20 !bg-amber-500 border-none" />
      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 z-20 !bg-amber-500 border-none" />
    </div>
  );
}

function AgentGroupNode({ data }) {
  return (
    <div className="w-full h-full bg-emerald-50 border border-emerald-300 rounded-2xl relative shadow-inner overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white px-4 py-2.5 text-sm font-bold flex items-center gap-2">
        {data.icon && <data.icon size={18} />}
        {data.label}
      </div>
    </div>
  );
}

const nodeTypes = {
  agentNode: AgentNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
  agentGroupNode: AgentGroupNode,
};

// --- Initial Data ---
const initialNodes = [];
const initialEdges = [];

export default function AgenticWorkflow({ suggestionId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!suggestionId) return;

    const fetchFlow = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProcessFlow(suggestionId);

        const transformed = transformFlowData(data);
        setNodes(transformed.nodes);
        setEdges(transformed.edges);
      } catch (err) {
        console.error('Failed to fetch flow:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [suggestionId, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (loading) {
    return (
      <div className="w-full h-[500px] border border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading automation workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] border border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">Failed to load workflow: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] border border-slate-200 rounded-2xl overflow-hidden relative bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="bg-white border border-slate-200 shadow-lg"
      >
        <Controls className="!bg-white !border-slate-200" />
        <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.25 }} />
      </ReactFlow>
    </div>
  );
}
