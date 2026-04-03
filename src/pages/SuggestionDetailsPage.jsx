import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Cpu, CheckCircle2, ChevronDown } from 'lucide-react'
import StepCard from '../components/analysis/StepCard'
import SuggestionCard from '../components/automation/SuggestionCard'

function AnimatedScore({ target }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!target) return
    const steps = 40
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setDisplay(Math.round(current))
      if (current >= target) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span className="text-5xl font-black text-brand-500 tabular-nums leading-none">
      {display}%
    </span>
  )
}

export default function SuggestionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [suggestion, setSuggestion] = useState(null)
  const [processData, setProcessData] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem(`suggestion_${id}`)
    if (data) {
      const parsed = JSON.parse(data)
      setSuggestion(parsed)

      // Read the cached analysis data from localStorage
      if (parsed.analysisId) {
        const analysisData = localStorage.getItem(`analysis_${parsed.analysisId}`)
        if (analysisData) {
          setProcessData(JSON.parse(analysisData))
        }
      }
    }

    // Cleanup on unmount — remove suggestion data to prevent stale loads
    return () => {
      localStorage.removeItem(`suggestion_${id}`)
    }
  }, [id])

  if (!suggestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white">
        <div className="text-center animate-pulse">
          <Cpu className="mx-auto mb-4 text-brand-500" size={48} />
          <h2 className="text-xl font-bold">Loading Suggestion Data...</h2>
          <p className="text-white/50">If this persists, the data might be lost.</p>
        </div>
      </div>
    )
  }

  const process = processData?.process
  const steps = processData?.steps || []
  // Find the step this suggestion belongs to
  const matchedStep = steps.find(s => s.id === suggestion.step_key)
  const matchedStepIndex = matchedStep ? steps.indexOf(matchedStep) : 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

      {/* ── Process Header Card ── */}
      {process && (
        <div
          className="card p-6 flex items-start justify-between gap-6 opacity-0 animate-slide-up"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-brand-500" />
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest">
                Analysis Details
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {process.title}
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
              {process.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
              Automation Score
            </p>
            <div className="flex items-center gap-2 justify-end">
              <AnimatedScore target={process.automation_score} />
            </div>
            {process.erp_system && (
              <p className="text-xs text-white/40 mt-1">ERP: {process.erp_system}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Step Card + Suggestion ── */}
      <div
        className="rounded-3xl  backdrop-blur-sm shadow-2xl space-y-6 opacity-0 animate-slide-up"
        style={{ animationDelay: '150ms', animationFillMode: 'both' }}
      >
        {/* Selected Step Card */}
        {matchedStep && (
          <div
            className="[&>div]:w-full opacity-0 animate-slide-up"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <StepCard
              step={matchedStep}
              index={matchedStepIndex}
              isSelected={true}
              isLast={true}
            />
          </div>
        )}

        {/* Down arrow connector */}
        <div
          className="flex justify-center opacity-0 animate-fade-in"
          style={{ animationDelay: '500ms', animationFillMode: 'both' }}
        >
          <div className="flex flex-col items-center">
            <div className="w-px h-4 bg-white/40" />
            <ChevronDown size={18} className="text-white/40 -mt-1" />
          </div>
        </div>

        {/* Suggestion Card */}
        <div
          className="grid grid-cols-1 gap-4 opacity-0 animate-slide-up"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <SuggestionCard suggestion={suggestion} index={0} hideChip />
        </div>

        {/* Down arrow connector to new card */}
        <div
          className="flex justify-center opacity-0 animate-fade-in"
          style={{ animationDelay: '700ms', animationFillMode: 'both' }}
        >
          <div className="flex flex-col items-center mt-2">
            <div className="w-px h-8 bg-dashed border-l border-white/20 border-dashed" />
            <ChevronDown size={18} className="text-white/40 -mt-2" />
          </div>
        </div>

        {/* Architecture & Deployment Card */}
        <div
          className="opacity-0 animate-slide-up"
          style={{ animationDelay: '800ms', animationFillMode: 'both' }}
        >
          <DeploymentModelCard />
        </div>
      </div>
    </div>
  )
}

function DeploymentModelCard() {
  const staticData = {
    operatingModel: "Workflow",
    architectureLayers: [
      {
        title: "User Interaction Layer",
        description: "Handles all user-facing interfaces including dashboards, chatbots, and approval workflows. Provides real-time status updates and human-in-the-loop decision points."
      },
      {
        title: "Agent Orchestration",
        description: "Central coordination engine that manages agent lifecycle, task routing, parallel execution, and retry logic. Ensures agents collaborate efficiently across multi-step processes."
      },
      {
        title: "ERP Integration",
        description: "Bi-directional connectors to SAP, Oracle, and other ERP systems. Handles data mapping, transaction posting, master data sync, and real-time event triggers."
      },
      {
        title: "Governance / Observability",
        description: "Audit trails, compliance logging, performance monitoring, and SLA tracking. Provides full transparency into agent decisions and actions for regulatory requirements."
      }
    ],
    erpContext: [
      {
        title: "System Configs",
        description: "Environment-specific parameters including API endpoints, authentication tokens, rate limits, and tenant configurations for multi-system connectivity."
      },
      {
        title: "Connect",
        description: "Secure connection layer managing OAuth2 flows, certificate-based auth, VPN tunnels, and connection pooling for high-throughput ERP communication."
      },
      {
        title: "Access Security",
        description: "Role-based access control (RBAC), data masking policies, IP whitelisting, and encryption-at-rest/in-transit for all agent-ERP data exchanges."
      }
    ],
    deploymentSteps: [
      { id: 1, label: "Click", description: "User initiates the agent deployment from the dashboard with a single click." },
      { id: 2, label: "Init", description: "Agent environment is provisioned, dependencies loaded, and configuration validated." },
      { id: 3, label: "Execute", description: "Agent begins processing the assigned task, interacting with ERP systems as needed." },
      { id: 4, label: "Verify", description: "Automated validation checks confirm output accuracy, data integrity, and compliance." },
      { id: 5, label: "Complete", description: "Task is marked done, audit logs are written, and results are pushed to stakeholders." }
    ]
  };

  return (
    <div className="card p-8 border-brand-500/20 bg-gradient-to-b from-white/5 to-transparent">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Cpu size={20} className="text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white/90">Agent Cluster Architecture</h2>
          <p className="text-xs text-white/40">Deployment blueprint & operating model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Operating Model / Architecture Layers */}
        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-1">
            Operating Model: {staticData.operatingModel}
          </h3>
          <p className="text-xs text-white/30 mb-5">Layered architecture for agent execution</p>
          <div className="space-y-4">
            {staticData.architectureLayers.map((layer, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className="text-[10px] font-bold text-brand-500/60 bg-brand-500/10 w-6 h-6 rounded-md flex items-center justify-center">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  {idx < staticData.architectureLayers.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-white/90">{layer.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed mt-1">{layer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ERP Context */}
        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-1">
            ERP Context
          </h3>
          <p className="text-xs text-white/30 mb-5">System integration & security configuration</p>
          <div className="space-y-4">
            {staticData.erpContext.map((item, idx) => (
              <div key={idx} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-blue-500/60" />
                  <p className="text-sm font-semibold text-white/90">{item.title}</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed pl-[22px]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Model Flow */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
          Agent Deployment Model
        </h3>
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-4 scrollbar-custom">
          {staticData.deploymentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-0 min-w-max flex-1">
              <div className="flex flex-col items-center gap-2 max-w-[120px]">
                <div className="w-12 h-12 rounded-full border border-brand-500/30 bg-brand-500/10 flex items-center justify-center text-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="text-sm font-bold">{step.id}</span>
                </div>
                <span className="text-xs font-semibold text-white/70">{step.label}</span>
                <p className="text-[10px] text-white/30 text-center leading-snug">{step.description}</p>
              </div>
              
              {idx < staticData.deploymentSteps.length - 1 && (
                <div className="flex items-center self-center mt-1 mx-1 flex-shrink-0" style={{ marginTop: '18px' }}>
                  <div className="w-12 h-px bg-brand-500/30" />
                  <ChevronDown size={12} className="text-brand-500/50 -rotate-90 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
