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
  return (
    <div className="bg-white border-2 border-[#003366] rounded-xl shadow-lg w-64 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="bg-[#003366] text-white p-3 flex items-center gap-2">
        {data.icon && <data.icon size={20} />}
        <span className="font-bold">{data.title}</span>
      </div>
      <div className="p-3 bg-blue-50/50">
        <ul className="space-y-2">
          {data.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-800 font-medium">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0" />
              {task}
            </li>
          ))}
        </ul>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
}

function ProcessNode({ data }) {
  return (
    <div className={`bg-white border-2 rounded-lg shadow-md p-3 flex items-center gap-3 min-w-[180px] ${data.borderColor || 'border-gray-300'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      {data.icon && <data.icon size={20} className={data.iconColor || 'text-[#003366]'} />}
      <span className="font-bold text-sm text-gray-800">{data.label}</span>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
}

function DecisionNode({ data }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#fff3cd] border-2 border-[#ffc107] shadow-md transform rotate-45 rounded-xl"></div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 z-20" />
      <div className="relative z-10 text-center text-xs font-bold text-gray-800 px-2">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 z-20" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 z-20" />
      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 z-20" />
    </div>
  );
}

function AgentGroupNode({ data }) {
  return (
    <div className="w-full h-full bg-[#003366]/5 border-2 border-[#003366] rounded-xl relative shadow-sm">
       <div className="absolute top-0 left-0 right-0 bg-[#003366] text-white px-4 py-3 font-bold rounded-t-[10px] flex items-center gap-2">
         {data.icon && <data.icon size={20} />}
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
    data: { label: 'New Sales Order', icon: ShoppingCart, borderColor: 'border-[#003366]', iconColor: 'text-[#003366]' },
    position: { x: 50, y: 250 },
  },
  {
    id: 'sales-agent',
    type: 'agentNode',
    data: { title: 'Sales Order Agent', icon: UserCircle, tasks: ['Validate Order Data'] },
    position: { x: 300, y: 235 },
  },
  {
    id: 'order-rejected',
    type: 'processNode',
    data: { label: 'Order Rejected / Correction', icon: XCircle, borderColor: 'border-[#dc3545]', iconColor: 'text-[#dc3545]' },
    position: { x: 650, y: 100 },
  },
  {
    id: 'query-db',
    type: 'processNode',
    data: { label: 'Query Inventory DB', icon: Database, borderColor: 'border-[#28a745]', iconColor: 'text-[#28a745]' },
    position: { x: 650, y: 350 },
  },
  {
    id: 'inventory-group',
    type: 'agentGroupNode',
    data: { label: 'Inventory Agent', icon: Database },
    position: { x: 950, y: 150 },
    style: { width: 300, height: 400 },
  },
  {
    id: 'check-stock',
    type: 'processNode',
    data: { label: 'Check Stock Levels', icon: Layers },
    position: { x: 40, y: 80 },
    parentNode: 'inventory-group',
    extent: 'parent',
  },
  {
    id: 'analyze-alloc',
    type: 'processNode',
    data: { label: 'Analyze Allocation', icon: BarChart },
    position: { x: 40, y: 180 },
    parentNode: 'inventory-group',
    extent: 'parent',
  },
  {
    id: 'determine-avail',
    type: 'processNode',
    data: { label: 'Determine Availability', icon: CheckSquare },
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
    data: { label: 'Reserve Stock', icon: Archive, borderColor: 'border-[#28a745]', iconColor: 'text-[#28a745]' },
    position: { x: 1600, y: 150 },
  },
  {
    id: 'accept-order',
    type: 'processNode',
    data: { label: 'Accept Order', icon: CheckCircle, borderColor: 'border-[#28a745]', iconColor: 'text-[#28a745]' },
    position: { x: 1900, y: 150 },
  },
  {
    id: 'reorder-agent',
    type: 'agentNode',
    data: { title: 'Reorder Agent', icon: RefreshCw, tasks: ['Consider Alternatives', 'Propose Options'] },
    position: { x: 1600, y: 400 },
  },
];

const initialEdges = [
  {
    id: 'e-start-sales',
    source: 'start',
    target: 'sales-agent',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  },
  {
    id: 'e-sales-reject',
    source: 'sales-agent',
    target: 'order-rejected',
    label: 'FAILED',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#dc3545', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#dc3545' },
    style: { stroke: '#dc3545', strokeWidth: 2 },
  },
  {
    id: 'e-sales-query',
    source: 'sales-agent',
    target: 'query-db',
    label: 'VALID',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#28a745', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#28a745' },
    style: { stroke: '#28a745', strokeWidth: 2 },
  },
  {
    id: 'e-query-check',
    source: 'query-db',
    target: 'check-stock',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  },
  {
    id: 'e-check-analyze',
    source: 'check-stock',
    target: 'analyze-alloc',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  },
  {
    id: 'e-analyze-determine',
    source: 'analyze-alloc',
    target: 'determine-avail',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  },
  {
    id: 'e-determine-decision',
    source: 'determine-avail',
    target: 'decision',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  },
  {
    id: 'e-decision-reserve',
    source: 'decision',
    sourceHandle: 'top',
    target: 'reserve-stock',
    label: 'YES',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#28a745', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#28a745' },
    style: { stroke: '#28a745', strokeWidth: 2 },
  },
  {
    id: 'e-decision-reorder',
    source: 'decision',
    sourceHandle: 'bottom',
    target: 'reorder-agent',
    label: 'NO / PARTIAL',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#dc3545', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#dc3545' },
    style: { stroke: '#dc3545', strokeWidth: 2 },
  },
  {
    id: 'e-reserve-accept',
    source: 'reserve-stock',
    target: 'accept-order',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#28a745' },
    style: { stroke: '#28a745', strokeWidth: 2 },
  },
];

export default function AgenticWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-[500px] border border-white/20 rounded-2xl overflow-hidden bg-white/[0.05] shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="!bg-white/10 !border-white/20 !fill-white" />
        <Background color="#ffffff" gap={16} size={1} style={{ opacity: 0.1 }} />
      </ReactFlow>
    </div>
  );
}
