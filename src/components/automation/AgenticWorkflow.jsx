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
        
        // Map icon strings to components
        const mappedNodes = data.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            icon: ICON_MAP[node.data.icon] || Database,
          },
          // Ensure group nodes have a default size if not provided
          style: node.type === 'agentGroupNode' ? { width: 300, height: 400, ...node.style } : node.style
        }));

        const mappedEdges = data.edges.map(edge => ({
          ...edge,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: edge.style?.stroke || '#4b5563' },
          style: { stroke: '#4b5563', strokeWidth: 2, ...edge.style },
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
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
