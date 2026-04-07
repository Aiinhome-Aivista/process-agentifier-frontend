import React, { useCallback } from 'react';
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
import { UserCircle, XCircle, Database, Layers, BarChart, CheckSquare, Archive, RefreshCw, ShoppingCart, CheckCircle } from 'lucide-react';

// --- Custom Nodes ---

function AgentNode({ data }) {
  const accentColor = data.accentColor || '#10b981';
  return (
    <div
      className="bg-brand-surface border rounded-xl shadow-2xl w-64 overflow-hidden ring-1 ring-white/5"
      style={{ borderColor: `${accentColor}40` }} // 40 is hex for 25% opacity
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 border-none" style={{ backgroundColor: accentColor }} />
      <div
        className="text-brand-dark p-3 flex items-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        {data.icon && <data.icon size={20} className="stroke-[2.5]" />}
        <span className="font-extrabold text-[10px] uppercase tracking-widest">{data.title}</span>
      </div>
      <div className="p-4 bg-white/[0.02]">
        <ul className="space-y-3">
          {data.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-white/70 font-medium">
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
      className="bg-brand-surface/90 backdrop-blur-md border rounded-xl shadow-xl p-3.5 flex items-center gap-3.5 min-w-[200px] transition-all duration-300 group"
      style={{ borderColor: `${accentColor}60` }} // 60 is hex for 37% opacity
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-white/20 border-none" />
      {data.icon && (
        <div style={{ color: accentColor }}>
          <data.icon size={20} className="stroke-[2.5]" />
        </div>
      )}
      <span className="font-bold text-xs text-white tracking-wide">{data.label}</span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-white/20 border-none" />
    </div>
  );
}

function DecisionNode({ data }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-500 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)] transform rotate-45 rounded-xl"></div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 z-20 !bg-amber-500 border-none" />
      <div className="relative z-10 text-center text-[10px] font-black uppercase tracking-wider text-amber-200 px-2 leading-tight">
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
    <div className="w-full h-full bg-brand-500/5 border border-brand-500/20 rounded-2xl relative shadow-inner overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-brand-600/80 backdrop-blur-md text-white px-4 py-2.5 text-sm font-bold flex items-center gap-2">
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

const initialNodes = [
  {
    id: 'start',
    type: 'processNode',
    data: { label: 'New Sales Order', icon: ShoppingCart, accentColor: '#10b981' },
    position: { x: 50, y: 250 },
  },
  {
    id: 'sales-agent',
    type: 'agentNode',
    data: { title: 'Sales Order Agent', icon: UserCircle, tasks: ['Validate Order Data'], accentColor: '#10b981' },
    position: { x: 300, y: 235 },
  },
  {
    id: 'order-rejected',
    type: 'processNode',
    data: { label: 'Order Rejected / Correction', icon: XCircle, accentColor: '#ef4444' },
    position: { x: 650, y: 100 },
  },
  {
    id: 'query-db',
    type: 'processNode',
    data: { label: 'Query Inventory DB', icon: Database, accentColor: '#10b981' },
    position: { x: 650, y: 350 },
  },
  {
    id: 'inventory-group',
    type: 'agentGroupNode',
    data: { label: 'Inventory Agent', icon: Database, accentColor: '#10b981' },
    position: { x: 950, y: 150 },
    style: { width: 300, height: 400 },
  },
  {
    id: 'check-stock',
    type: 'processNode',
    data: { label: 'Check Stock Levels', icon: Layers, accentColor: '#10b981' },
    position: { x: 40, y: 80 },
    parentNode: 'inventory-group',
    extent: 'parent',
  },
  {
    id: 'analyze-alloc',
    type: 'processNode',
    data: { label: 'Analyze Allocation', icon: BarChart, accentColor: '#10b981' },
    position: { x: 40, y: 180 },
    parentNode: 'inventory-group',
    extent: 'parent',
  },
  {
    id: 'determine-avail',
    type: 'processNode',
    data: { label: 'Determine Availability', icon: CheckSquare, accentColor: '#10b981' },
    position: { x: 40, y: 280 },
    parentNode: 'inventory-group',
    extent: 'parent',
  },
  {
    id: 'decision',
    type: 'decisionNode',
    data: { label: 'Stock Available?' },
    position: { x: 1350, y: 280 },
  },
  {
    id: 'reserve-stock',
    type: 'processNode',
    data: { label: 'Reserve Stock', icon: Archive, accentColor: '#10b981' },
    position: { x: 1600, y: 150 },
  },
  {
    id: 'accept-order',
    type: 'processNode',
    data: { label: 'Accept Order', icon: CheckCircle, accentColor: '#10b981' },
    position: { x: 1900, y: 150 },
  },
  {
    id: 'reorder-agent',
    type: 'agentNode',
    data: { title: 'Reorder Agent', icon: RefreshCw, tasks: ['Consider Alternatives', 'Propose Options'], accentColor: '#10b981' },
    position: { x: 1600, y: 400 },
  },
];

const initialEdges = [
  {
    id: 'e-start-sales',
    source: 'start',
    target: 'sales-agent',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
    style: { stroke: '#4b5563', strokeWidth: 2 },
  },
  {
    id: 'e-sales-reject',
    source: 'sales-agent',
    target: 'order-rejected',
    label: 'FAILED',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#ef4444', fontWeight: 800, fontSize: 10 },
    labelBgStyle: { fill: '#0a0a0a', fillOpacity: 0.8, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e-sales-query',
    source: 'sales-agent',
    target: 'query-db',
    label: 'VALID',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#10b981', fontWeight: 800, fontSize: 10 },
    labelBgStyle: { fill: '#0a0a0a', fillOpacity: 0.8, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e-query-check',
    source: 'query-db',
    target: 'check-stock',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
    style: { stroke: '#4b5563', strokeWidth: 2 },
  },
  {
    id: 'e-check-analyze',
    source: 'check-stock',
    target: 'analyze-alloc',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
    style: { stroke: '#4b5563', strokeWidth: 2 },
  },
  {
    id: 'e-analyze-determine',
    source: 'analyze-alloc',
    target: 'determine-avail',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
    style: { stroke: '#4b5563', strokeWidth: 2 },
  },
  {
    id: 'e-determine-decision',
    source: 'determine-avail',
    target: 'decision',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
    style: { stroke: '#4b5563', strokeWidth: 2 },
  },
  {
    id: 'e-decision-reserve',
    source: 'decision',
    sourceHandle: 'top',
    target: 'reserve-stock',
    label: 'YES',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#10b981', fontWeight: 800, fontSize: 10 },
    labelBgStyle: { fill: '#0a0a0a', fillOpacity: 0.8, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e-decision-reorder',
    source: 'decision',
    sourceHandle: 'bottom',
    target: 'reorder-agent',
    label: 'NO / PARTIAL',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#ef4444', fontWeight: 800, fontSize: 10 },
    labelBgStyle: { fill: '#0a0a0a', fillOpacity: 0.8, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e-reserve-accept',
    source: 'reserve-stock',
    target: 'accept-order',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
];

export default function AgenticWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-[600px] border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0a] shadow-inner relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="!bg-brand-dark/50"
      >
        <Controls className="!bg-brand-surface !border-white/10" />
        <Background color="#10b981" gap={20} size={1} style={{ opacity: 0.05 }} />
      </ReactFlow>
    </div>
  );
}
