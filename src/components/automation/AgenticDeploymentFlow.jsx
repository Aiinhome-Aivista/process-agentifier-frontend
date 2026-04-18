import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    ReactFlowProvider,
    MarkerType,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ControlButton,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Mail,
    Database,
    MessageSquare,
    Webhook,
    Cloud,
    Layout,
    Cpu,
    Zap,
    UserCheck,
    FileText,
    Archive,
    RefreshCcw,
    Truck,
    ShieldCheck,
    Brain,
    Settings,
    Search,
    Server,
    Maximize2,
    Minimize2,
    Terminal,
    Smartphone,
    Layers,
    Users,
    ChevronRight,
    SearchCode,
    Bot,
    History,
    Key,
    Lock,
    Globe,
    HardDrive,
    ScrollText,
    Loader2,
    AlertCircle,
    CheckSquare,
    CheckCircle,
} from 'lucide-react';
import { getAutomationArchitecture } from '../../services/api';
import { getLayoutedElements } from '../layout/Dagre';

// --- Icon Mapping (Common across components) ---
const ICON_MAP = {
    Database,
    Server,
    Zap,
    Users,
    ShieldCheck,
    CheckSquare,
    Cloud,
    Bot,
    FileText,
    History,
    Key,
    Lock,
    Globe,
    Search,
    Mail,
    Webhook
};

function getEdgeStyle(label = '') {
    // All edges are solid black as per user request
    return {
        stroke: '#000000',
        strokeWidth: 2,
        labelColor: '#000000',
        animated: false,
    };
}

// --- Custom Node Components ---

const LayerNode = ({ data }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 group">
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-800 [writing-mode:vertical-rl] rotate-180 text-center leading-tight">
                {data.label}
            </h3>
            <div className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={40} strokeWidth={3} />
            </div>
        </div>
    );
};

const ConnectorNode = ({ data }) => {
    const { title, description, icon: Icon, color = 'indigo' } = data;
    const colors = {
        indigo: 'border-indigo-200 bg-indigo-50/50 text-indigo-600',
        emerald: 'border-emerald-200 bg-emerald-50/50 text-emerald-600',
        amber: 'border-amber-200 bg-amber-50/50 text-amber-600',
        cyan: 'border-cyan-200 bg-cyan-50/50 text-cyan-600',
    };

    return (
        <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-xl bg-white flex flex-col gap-2 min-w-[220px] max-w-[260px] ${colors[color] || colors.indigo}`}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-300" />
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm ring-1 ring-slate-100`}>
                    <Icon size={20} className={colors[color]?.split(' ')[2]} />
                </div>
                <h4 className="font-black text-base uppercase tracking-wider text-slate-900 leading-none">{title}</h4>
            </div>
            <p className="text-base font-medium text-slate-500 leading-relaxed px-1">
                {description}
            </p>
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};



const AgentNode = ({ data }) => {
    const { title, description, subItems = [], icon: Icon = Bot } = data;
    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-lg min-w-[240px] hover:border-brand-500 transition-all group">
            <div className="flex items-start gap-4 mb-3">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-brand-50 transition-colors">
                    <Icon className="text-slate-700 group-hover:text-brand-600" size={24} />
                </div>
                <div className="text-left">
                    <h5 className="font-black text-base uppercase text-slate-900 leading-tight mb-1 tracking-tight">{title}</h5>
                    <p className="text-base text-slate-500 font-medium leading-relaxed">{description}</p>
                </div>
            </div>
            {subItems.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-slate-50 pt-2">
                    {subItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                            {item.icon && <item.icon size={12} className="text-slate-400" />}
                            <span className="text-base font-black text-slate-600 uppercase tracking-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-300" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};

const OrchestratorNode = ({ data }) => {
    const { title, description } = data;
    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-lg min-w-[240px] relative group transition-all hover:border-brand-500">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-brand-50">
                    <Zap size={20} className="text-slate-700 group-hover:text-brand-600" />
                </div>
                <h5 className="font-black text-base uppercase text-slate-900 tracking-tight leading-tight">{title}</h5>
            </div>
            <p className="text-base text-slate-500 font-medium leading-relaxed">{description}</p>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-300" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};

const DataNode = ({ data }) => {
    const { title, description, icon: Icon = Database } = data;
    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-lg flex items-center gap-4 min-w-[200px] group transition-all hover:scale-105">
            <div className="p-3 bg-blue-50 rounded-xl">
                <Icon className="text-blue-600" size={24} />
            </div>
            <div className="text-left">
                <h5 className="font-black text-base uppercase text-slate-900 leading-tight mb-0.5 tracking-tight">{title}</h5>
                <p className="text-base text-slate-500 font-semibold uppercase tracking-tighter">{description}</p>
            </div>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-300" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};

const OutputCardNode = ({ data }) => {
    const { title, description, items = [], color = 'slate' } = data;
    const colors = {
        slate: 'bg-slate-50 border-slate-200 text-slate-600',
        green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
        amber: 'bg-amber-50 border-amber-100 text-amber-600',
    };
    return (
        <div className={`p-5 rounded-3xl border-2 shadow-xl min-w-[280px] flex flex-col gap-4 bg-white border-slate-200 ${colors[color]?.split(' ')[1]}`}>
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 text-center border-b pb-3">{title}</h4>
            {description && <p className="text-[10px] text-slate-500 font-bold text-center -mt-2">{description}</p>}
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all hover:translate-x-1 ${colors[item.color] || colors.slate}`}>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight leading-none">{item.label}</span>
                    </div>
                ))}
            </div>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};

const SharedContextNode = ({ data }) => {
    const { title, icon: Icon, items = [] } = data;
    return (
        <div className="bg-emerald-50/30 rounded-[2rem] border-2 border-emerald-100 p-6 flex flex-col gap-4 shadow-lg min-w-[260px] relative">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                    <Icon className="text-emerald-700" size={20} />
                </div>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">{title}</h4>
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="bg-white border border-emerald-50 p-2.5 rounded-xl flex items-center gap-3 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${item.dbType === 'vector' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                        <div className="text-left leading-none">
                            <h5 className="text-base font-black uppercase text-slate-900 mb-0.5">{item.label}</h5>
                            <p className="text-[8px] text-slate-400 font-bold">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-300" />
        </div>
    );
};

const GroupFrame = ({ data }) => {
    return (
        <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/30 p-10 flex flex-col">
            {data.label && (
                <div className="absolute -top-4 left-10 bg-white border-2 border-slate-100 px-6 py-2 rounded-2xl shadow-sm">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{data.label}</span>
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    layer: LayerNode,
    connector: ConnectorNode,

    agent: AgentNode,
    orchestrator: OrchestratorNode,
    data: DataNode,
    output: OutputCardNode,
    shared: SharedContextNode,
    frame: GroupFrame,
};

const Library = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" />
    </svg>
)
function ArchitectureFlowContent({ suggestionId }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const transformArchitectureData = useCallback((apiData) => {
        const nodes = (apiData.nodes || []).map(node => {
            const id = node.id.toLowerCase();
            const type = (node.type || '').toLowerCase();
            const label = node.data?.label || node.data?.title || 'Unknown';
            const description = node.data?.description || '';

            if (id.includes('orchestrator') || type === 'orchestrator' || type === 'system' && id.includes('orchestrator')) {
                return {
                    ...node,
                    type: 'orchestrator',
                    data: {
                        title: label,
                        description
                    }
                };
            }

            // Map System -> Connector
            if (type === 'system') {
                return {
                    ...node,
                    type: 'connector',
                    data: {
                        title: label,
                        description,
                        icon: ICON_MAP[node.data?.icon] || (id.includes('erp') ? Server : (id.includes('db') || id.includes('log') || id.includes('dat')) ? Database : id.includes('gateway') ? Zap : id.includes('connector') ? Layers : Cloud),
                        color: id.includes('gateway') ? 'cyan' : id.includes('erp') ? 'amber' : 'indigo'
                    }
                };
            }

            // Map Human -> Agent (with User icon)
            if (type === 'human') {
                return {
                    ...node,
                    type: 'agent',
                    data: {
                        title: label,
                        description,
                        icon: Users,
                        subItems: node.data?.subItems || []
                    }
                };
            }

            // Map Agent -> Agent
            if (type === 'agent') {
                return {
                    ...node,
                    type: 'agent',
                    data: {
                        title: label,
                        description,
                        icon: (id.includes('verification') || id.includes('validation')) ? ShieldCheck : id.includes('posting') ? Zap : id.includes('upload') ? Cloud : id.includes('compliance') ? CheckSquare : Bot,
                        subItems: node.data?.subItems || []
                    }
                };
            }

            // Map Output -> Output
            if (type === 'output') {
                return {
                    ...node,
                    type: 'output',
                    data: {
                        title: label,
                        description,
                        items: node.data?.items || [],
                        color: 'green'
                    }
                };
            }

            // Map Shared -> Shared
            if (type === 'shared') {
                return {
                    ...node,
                    type: 'shared',
                    data: {
                        title: label,
                        icon: ICON_MAP[node.data?.icon] || Database,
                        items: node.data?.items || []
                    }
                };
            }

            // Map Frame/Layer -> Frame
            if (type === 'frame' || type === 'layer') {
                return {
                    ...node,
                    type: 'frame',
                    data: { label }
                };
            }

            return node;
        });

        const edges = (apiData.edges || []).map(edge => {
            const styleMeta = getEdgeStyle(edge.label || '');
            return {
                ...edge,
                type: 'smoothstep',
                label: (edge.label || '').toUpperCase(),
                labelStyle: { fill: styleMeta.labelColor, fontWeight: 900, fontSize: 9 },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, padding: 4 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: styleMeta.stroke
                },
                style: {
                    stroke: styleMeta.stroke,
                    strokeWidth: styleMeta.strokeWidth
                },
                animated: styleMeta.animated
            };
        });

        // Apply Dagre Layout - Left-to-Right
        return getLayoutedElements(nodes, edges, 'LR');
    }, []);

    const lastFetchedId = useRef(null);

    useEffect(() => {
        if (!suggestionId || lastFetchedId.current === suggestionId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            lastFetchedId.current = suggestionId;
            try {
                const json = await getAutomationArchitecture(suggestionId);
                const data = json?.agent_cluster_architecture || (json?.nodes ? json : (json?.data?.nodes ? json.data : null));

                if (data && data.nodes) {
                    const { nodes: transformedNodes, edges: transformedEdges } = transformArchitectureData(data);
                    setNodes(transformedNodes);
                    setEdges(transformedEdges);
                } else {
                    setError('No architecture data found for this suggestion');
                }
            } catch (err) {
                console.error('Failed to fetch architecture:', err);
                setError(err.message || 'Failed to load architecture data');
                lastFetchedId.current = null;
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [suggestionId, transformArchitectureData, setNodes, setEdges]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);
    const { fitView } = useReactFlow();

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error entering fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [fitView]);

    if (loading) {
        return (
            <div className={`w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 transition-all duration-300 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading deployment architecture...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`w-full border border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 transition-all duration-300 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
                <div className="flex flex-col items-center gap-3 text-red-500 p-8 text-center max-w-md">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm font-medium">Failed to load architecture: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`w-full border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 relative transition-all duration-500 shadow-2xl ${isFullscreen ? 'h-screen w-screen rounded-none' : 'h-[600px]'
                }`}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.05}
                maxZoom={1.5}
                className="bg-white border border-slate-200 shadow-lg"
                defaultEdgeOptions={{ type: 'smoothstep' }}
            >
                <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.25 }} />
                <Controls className="!bg-white !border-slate-200" showFitView={false}>
                    <ControlButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        <div className="flex items-center justify-center w-full h-full text-slate-700">
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </div>
                    </ControlButton>
                </Controls>
            </ReactFlow>
        </div>
    );
};


function AgenticDeploymentFlow({ suggestionId }) {
    return (
        <ReactFlowProvider>
            <ArchitectureFlowContent suggestionId={suggestionId} />
        </ReactFlowProvider>
    );
}

export default AgenticDeploymentFlow;
