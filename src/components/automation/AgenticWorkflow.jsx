import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  Handle,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserCircle, XCircle, Database, Layers, BarChart, CheckSquare, Archive, RefreshCw, ShoppingCart, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getProcessFlow } from '../../services/api';
import { getLayoutedElements } from '../layout/Dagre';

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

  const decisionIds = new Set(
    rawNodes
      .filter((n) => (n.data?.label || '').toLowerCase().includes('decision'))
      .map((n) => n.id)
  );

  const stepById = new Map(rawNodes.map((n) => [n.id, n]));

  // --- Map Nodes ---
  const mappedNodes = rawNodes.map((node) => {
    if (node.type === 'agentGroupNode') {
      return {
        ...node,
        data: {
          ...node.data,
          icon: ICON_MAP[node.data?.icon] || Database,
          accentColor: node.data?.accentColor || '#10b981',
        },
      };
    }

    if (node.type === 'agentNode') {
      const edgeFromAgent = rawEdges.find(
        (e) => e.source === node.id && stepById.get(e.target)
      );
      const targetStep = edgeFromAgent ? stepById.get(edgeFromAgent.target) : null;
      const targetAccent = node.data?.accentColor
        || (targetStep ? getStepAccent(targetStep.data?.stepType) : '#10b981');

      const rawTasks = (node.data?.tasks || []).filter(Boolean);
      const truncatedTasks = rawTasks.length
        ? rawTasks.map((t) =>
          t.length > 80 ? t.slice(0, 80) + '…' : t
        )
        : ['Automates related process steps'];

      return {
        ...node,
        data: {
          ...node.data,
          icon: ICON_MAP[node.data?.icon] || UserCircle,
          title: node.data?.title || 'Automation Agent',
          tasks: truncatedTasks,
          accentColor: targetAccent,
        },
      };
    }

    // Process or Decision Nodes
    const isDecision = decisionIds.has(node.id);
    const accent = getStepAccent(node.data?.stepType);
    return {
      ...node,
      type: isDecision ? 'decisionNode' : 'processNode',
      extent: node.parentNode ? 'parent' : undefined,
      data: isDecision
        ? { label: node.data?.label || 'Decision' }
        : {
          ...node.data,
          label: node.data?.label || 'Process Step',
          icon: ICON_MAP[node.data?.icon] || Database,
          accentColor: accent,
        },
    };

  });

  // --- Map Edges ---
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
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: styleMeta.stroke
      },
      style: {
        stroke: styleMeta.stroke,
        strokeWidth: styleMeta.strokeWidth,
        ...(styleMeta.strokeDasharray
          ? { strokeDasharray: styleMeta.strokeDasharray }
          : {}),
      },
    };

    // Edge direction correction for Agent -> Step connections
    if (
      rawNodes.find(n => n.id === edge.source && n.type === 'agentNode') &&
      rawNodes.find(n => n.id === edge.target && (n.type === 'processNode' || n.id?.startsWith('step-')))
    ) {
      result.source = edge.target;
      result.target = edge.source;
    }

    // Handle decision node branching handles
    if (
      decisionIds.has(edge.source) &&
      edge.label?.toLowerCase().includes('conditionally')
    ) {
      const idx = conditionalBranchIndex.get(edge.source) || 0;
      conditionalBranchIndex.set(edge.source, idx + 1);
      result.sourceHandle = idx === 0 ? 'top' : 'bottom';
      result.label = idx === 0 ? 'YES' : 'NO / PARTIAL';
      result.style = {
        ...result.style,
        stroke: idx === 0 ? '#10b981' : '#ef4444',
        ...(idx === 1 ? { strokeDasharray: '5,5' } : {}),
      };
      result.markerEnd = {
        type: MarkerType.ArrowClosed,
        color: idx === 0 ? '#10b981' : '#ef4444',
      };
      result.labelStyle = {
        fill: idx === 0 ? '#10b981' : '#ef4444',
        fontWeight: 800,
        fontSize: 10,
      };
    }

    return result;
  });

  // Apply Dagre Layout - Reverted to Left-to-Right
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mappedNodes, mappedEdges, 'LR');

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
}


// --- Custom Nodes ---

function AgentNode({ data }) {
  const accentColor = data.accentColor || '#6366f1';
  const hasTasks = Array.isArray(data.tasks) && data.tasks.length > 0;
  return (
    <div
      className="bg-white border rounded-2xl shadow-xl w-80 overflow-hidden ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
      style={{ borderColor: `${accentColor}40` }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
      <div
        className="text-white p-4 flex items-center gap-3"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
        }}
      >
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          {data.icon && <data.icon size={22} className="stroke-[2.5]" />}
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-tight">{data.title}</span>
        </div>
      </div>
      {hasTasks && (
        <div className="p-4 bg-slate-50/50 backdrop-blur-sm">
          <ul className="space-y-3">
            {data.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px] text-slate-700 font-medium leading-relaxed">
                <div
                  className="mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: accentColor }}
                />
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
    </div>
  );
}

function ProcessNode({ data }) {
  const accentColor = data.accentColor || '#10b981';
  return (
    <div
      className="bg-white border-2 rounded-2xl shadow-xl p-5 flex items-center gap-4 min-w-[260px] max-w-[320px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
      style={{ borderColor: `${accentColor}30` }}
    >
      <div 
        className="absolute top-0 left-0 w-1.5 h-full" 
        style={{ backgroundColor: accentColor }}
      />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
      {data.icon && (
        <div 
          className="p-2.5 rounded-xl bg-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-300"
          style={{ color: accentColor }}
        >
          <data.icon size={24} className="stroke-[2.5]" />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-sm text-slate-800 leading-tight whitespace-normal overflow-wrap-anywhere">
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
    </div>
  );
}

function DecisionNode({ data }) {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center group pointer-events-none">
      <div className="absolute inset-2 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-500 shadow-xl transform rotate-45 rounded-2xl group-hover:scale-105 transition-transform duration-500"></div>
      <div className="absolute inset-0 border border-amber-500/20 transform rotate-45 rounded-2xl scale-[1.12]"></div>
      
      <Handle type="target" position={Position.Left} className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white" />
      
      <div className="relative z-10 text-center flex flex-col items-center pointer-events-auto">
        <span className="text-[9px] font-black text-amber-500 mb-1 tracking-tighter">DECISION</span>
        <div className="text-xs font-bold uppercase tracking-wider text-amber-900 px-4 leading-tight max-w-[90px]">
          {data.label}
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 z-20 !bg-amber-500 border-none opacity-0" />
      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 z-20 !bg-amber-500 border-none opacity-0" />
    </div>
  );
}

function AgentGroupNode({ data }) {
  const accentColor = data.accentColor || '#6366f1';
  return (
    <div
      className="w-full h-full border-2 rounded-[2rem] relative shadow-inner overflow-hidden"
      style={{
        backgroundColor: `${accentColor}05`, 
        borderColor: `${accentColor}20`
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 text-white px-6 py-4 text-base font-black flex items-center gap-3 shadow-lg z-10"
        style={{ 
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`
        }}
      >
        <div className="bg-white/20 p-1.5 rounded-lg">
          {data.icon && <data.icon size={20} />}
        </div>
        <span className="uppercase tracking-[0.1em]">{data.label}</span>
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

function AgenticFlowContent({ suggestionId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fitView } = useReactFlow();

const hasFetched = useRef(false);


useEffect(() => {
  if (!suggestionId || hasFetched.current) return;

  hasFetched.current = true;

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
}, [suggestionId,fitView]);



  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (loading) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading automation workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">Failed to load workflow: {error}</p>
        </div>
      </div>
    );
  }

  if (!loading && nodes.length === 0) {
    return (
      <div className="w-full h-[600px] border border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="bg-white p-6 rounded-full shadow-inner">
          <Layers className="w-12 h-12 text-slate-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">No Workflow Detected</p>
          <p className="text-sm text-slate-500 max-w-[300px] mx-auto">This suggestion doesn't have any automated steps assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-slate-200 rounded-2xl overflow-hidden relative bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        attributionPosition="bottom-right"
        className="bg-white border border-slate-200 shadow-lg"
      >
        <Controls className="!bg-white !border-slate-200" />
        <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.25 }} />
      </ReactFlow>
    </div>
  );
}

export default function AgenticWorkflow(props) {
  return (
    <ReactFlowProvider>
      <AgenticFlowContent {...props} />
    </ReactFlowProvider>
  );
}
