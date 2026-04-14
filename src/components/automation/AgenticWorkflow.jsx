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
  useReactFlow,
  ControlButton,
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserCircle, XCircle, Database, Layers, BarChart, CheckSquare, Archive, RefreshCw, ShoppingCart, CheckCircle, Loader2, AlertCircle, Maximize2, Minimize2, Lightbulb } from 'lucide-react';
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
  const text = (label || '').toLowerCase();

  if (text.includes('failed')) {
    return {
      stroke: '#ef4444',
      strokeWidth: 2.5,
      strokeDasharray: '5,5',
      labelColor: '#ef4444',
      animated: true,
    };
  }

  if (text.includes('valid') || text.includes('approve') || text.includes('yes') || text.includes('automates') || text.includes('agentic')) {
    return {
      stroke: '#10b981', // Solid Green for automation line
      strokeWidth: 2.5,
      strokeDasharray: 'none',
      labelColor: '#000000', // Black color as requested
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

  // All other cases including "FLOWS"
  return {
    stroke: '#000000', // Solid Black
    strokeWidth: 2,
    strokeDasharray: 'none',
    labelColor: '#000000',
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
          accentColor: '#10b981', // Project theme green for Agent cards
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
        strokeDasharray: styleMeta.strokeDasharray || 'none',
      },
    };

    // Detect if this is an agentic/automated connection
    const isAgentic = (edge.label || '').toLowerCase().includes('automates') ||
      (edge.label || '').toLowerCase().includes('agentic');

    if (isAgentic) {
      result.type = 'agenticEdge';
      result.markerEnd = undefined; // Use gear icon instead of arrow
    }

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
      result.sourceHandle = idx === 0 ? 'bottom' : 'right';
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

  // Apply Dagre Layout - Top-to-Bottom
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mappedNodes, mappedEdges, 'TB');

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
}


// --- Custom Nodes ---

function AgentNode({ data, targetPosition, sourcePosition }) {
  const accentColor = data.accentColor || '#6366f1';
  const hasTasks = Array.isArray(data.tasks) && data.tasks.length > 0;
  return (
    <div
      className={`bg-white border-[3px] rounded-2xl shadow-xl w-80 overflow-hidden ring-1 ring-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${data.isHighlighted ? 'ring-4 ring-offset-4 ring-brand-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[1.05]' : ''
        } ${data.isDimmed ? 'opacity-30 grayscale-[30%] blur-[0.5px]' : 'opacity-100'}`}
      style={{
        borderColor: data.isHighlighted ? '#10b981' : `${accentColor}`,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <Handle type="target" position={targetPosition} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
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
      <Handle type="source" position={sourcePosition} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
    </div>
  );
}

function ProcessNode({ data, targetPosition, sourcePosition }) {
  const accentColor = data.accentColor || '#10b981';
  return (
    <div
      className={`bg-white border-2 rounded-2xl shadow-xl p-5 flex items-center gap-4 min-w-[260px] max-w-[320px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden ${data.isHighlighted ? 'ring-4 ring-offset-2 ring-brand-500 scale-105 shadow-[0_30px_50px_-15px_rgba(0,0,0,0.3)]' : ''
        } ${data.isDimmed ? 'opacity-30 grayscale-[30%] blur-[0.5px]' : 'opacity-100'}`}
      style={{
        borderColor: data.isHighlighted ? accentColor : `${accentColor}30`,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ backgroundColor: accentColor }}
      />
      <Handle type="target" position={targetPosition} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
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
      <Handle type="source" position={sourcePosition} className="w-3 h-3 !bg-slate-300 border-2 border-white" />
    </div>
  );
}

function DecisionNode({ data, targetPosition }) {
  return (
    <div className={`relative w-36 h-36 flex items-center justify-center group pointer-events-none transition-all duration-700 ${data.isHighlighted ? 'scale-110' : ''} ${data.isDimmed ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
      <div className={`absolute inset-2 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-500 shadow-xl transform rotate-45 rounded-2xl group-hover:scale-105 transition-transform duration-500 ${data.isHighlighted ? 'ring-4 ring-amber-500 ring-offset-4 shadow-amber-500/40' : ''}`}></div>
      <div className={`absolute inset-0 border border-amber-500/20 transform rotate-45 rounded-2xl scale-[1.12] ${data.isHighlighted ? 'border-amber-500 opacity-100 animate-pulse' : ''}`}></div>

      <Handle type="target" position={targetPosition} className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white" />

      <div className="relative z-10 text-center flex flex-col items-center pointer-events-auto">
        <span className="text-[9px] font-black text-amber-500 mb-1 tracking-tighter">DECISION</span>
        <div className="text-xs font-bold uppercase tracking-wider text-amber-900 px-4 leading-tight max-w-[90px]">
          {data.label}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white shadow-sm" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white shadow-sm" />
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3 z-20 !bg-amber-500 border-2 border-white shadow-sm" />
    </div>
  );
}

function AgentGroupNode({ data }) {
  const accentColor = data.accentColor || '#6366f1';
  return (
    <div
      className={`w-full h-full border-2 rounded-[2rem] relative shadow-inner overflow-hidden transition-all duration-700 ${data.isHighlighted ? 'ring-8 ring-brand-500/20 border-brand-500' : ''
        } ${data.isDimmed ? 'opacity-20 backdrop-grayscale' : 'opacity-100'}`}
      style={{
        backgroundColor: data.isHighlighted ? `${accentColor}15` : `${accentColor}05`,
        borderColor: data.isHighlighted ? accentColor : `${accentColor}20`
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

function AgenticEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  animated
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX}px,${targetY}px)`,
            pointerEvents: 'none',
          }}
          className="z-50"
        >
          <div className="bg-white rounded-full p-1 shadow-md border-2 border-[#10b981] -translate-x-2">
            <Lightbulb
              size={20}
              className="text-black "
            />
          </div>
        </div>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: labelBgStyle?.fill || '#ffffff',
              opacity: labelBgStyle?.fillOpacity || 0.9,
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
            }}
            className="nodrag nopan shadow-sm font-bold"
          >
            <span 
              style={{ 
                ...labelStyle, 
                color: labelStyle?.fill || '#000000',
                fill: undefined 
              }} 
            >
              {label}
            </span>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}


const nodeTypes = {
  agentNode: AgentNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
  agentGroupNode: AgentGroupNode,
};

const edgeTypes = {
  agenticEdge: AgenticEdge,
};

// --- Initial Data ---
const initialNodes = [];
const initialEdges = [];

function AgenticFlowContent({ suggestionId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [selectedEdgeInfo, setSelectedEdgeInfo] = useState(null);
  const { fitView } = useReactFlow();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

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
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Small delay to let the browser resize before fitting view
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fitView]);

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
  }, [suggestionId, fitView]);



  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onEdgeClick = useCallback((event, edge) => {
    setHighlightedNodes([edge.source, edge.target]);

    // Find node labels for the info overlay
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    setSelectedEdgeInfo({
      id: edge.id,
      label: edge.label || 'Connection',
      source: sourceNode?.data?.label || sourceNode?.data?.title || 'Unknown Source',
      sourceType: sourceNode?.type === 'agentNode' ? 'Agent' : 'Process',
      sourceIcon: sourceNode?.data?.icon,
      target: targetNode?.data?.label || targetNode?.data?.title || 'Unknown Target',
      targetType: targetNode?.type === 'agentNode' ? 'Agent' : 'Process',
      targetIcon: targetNode?.data?.icon,
      accentColor: sourceNode?.data?.accentColor || '#6366f1'
    });
  }, [nodes]);

  const onPaneClick = useCallback(() => {
    setHighlightedNodes([]);
    setSelectedEdgeInfo(null);
  }, []);

  const onNodeClick = useCallback(() => {
    setHighlightedNodes([]);
    setSelectedEdgeInfo(null);
  }, []);

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
    <div
      ref={containerRef}
      className={`w-full border border-slate-200 rounded-2xl overflow-hidden relative bg-slate-50 transition-all duration-300 ${isFullscreen ? 'h-screen w-screen rounded-none' : 'h-[600px]'
        }`}
    >
      <ReactFlow
        nodes={nodes.map(node => {
          const isHighlighted = highlightedNodes.includes(node.id);
          const isDimmed = highlightedNodes.length > 0 && !isHighlighted;
          return {
            ...node,
            data: { ...node.data, isHighlighted, isDimmed }
          };
        })}
        edges={edges.map(edge => {
          const isSelected = selectedEdgeInfo?.id === edge.id;
          const isDimmed = !!selectedEdgeInfo && !isSelected;

          return {
            ...edge,
            animated: isSelected ? true : edge.animated,
            style: {
              ...edge.style,
              opacity: isDimmed ? 0.15 : 1,
              strokeWidth: isSelected ? 5 : (edge.style?.strokeWidth || 2),
              filter: isSelected ? 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.4))' : 'none',
              transition: 'all 0.4s ease'
            },
            markerEnd: typeof edge.markerEnd === 'object' ? {
              ...edge.markerEnd,
              opacity: isDimmed ? 0.2 : 1
            } : edge.markerEnd
          };
        })}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        attributionPosition="bottom-right"
        className="bg-white border border-slate-200 shadow-lg"
      >
        <Controls className="!bg-white !border-slate-200" showFitView={false}>
          <ControlButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <div className="flex items-center justify-center w-full h-full text-slate-700">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </div>
          </ControlButton>
        </Controls>
        <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.25 }} />

        {selectedEdgeInfo && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in slide-in-from-top-6 duration-300">
            <div className="bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] rounded-2xl px-4 py-3 flex items-center gap-6 border border-white/50 ring-1 ring-slate-900/5">
              {/* Source Node Info */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 shadow-inner" style={{ color: selectedEdgeInfo.accentColor }}>
                  {selectedEdgeInfo.sourceIcon && <selectedEdgeInfo.sourceIcon size={20} className="stroke-[2.5]" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{selectedEdgeInfo.sourceType}</span>
                  <span className="text-[13px] font-bold text-slate-800 leading-tight max-w-[140px]">{selectedEdgeInfo.source}</span>
                </div>
              </div>

              {/* Edge/Connection Info */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-brand-500 to-transparent relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse"></div>
                </div>
                <div className="bg-brand-50/50 px-2 py-0.5 rounded-full border border-brand-100 shadow-sm">
                  <span className="text-[9px] font-black text-black uppercase tracking-[0.1em] whitespace-nowrap">
                    {selectedEdgeInfo.label}
                  </span>
                </div>
              </div>

              {/* Target Node Info - Now Reordered: Icon then Text */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 shadow-inner text-brand-500">
                  {selectedEdgeInfo.targetIcon && <selectedEdgeInfo.targetIcon size={20} className="stroke-[2.5]" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{selectedEdgeInfo.targetType}</span>
                  <span className="text-[13px] font-bold text-slate-800 leading-tight max-w-[140px]">{selectedEdgeInfo.target}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onPaneClick}
                className="p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-300 rounded-lg transition-all duration-300 group"
              >
                <XCircle size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </div>
        )}
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
