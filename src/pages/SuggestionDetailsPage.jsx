import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Cpu, CheckCircle2, ChevronDown } from 'lucide-react'
import StepCard from '../components/analysis/StepCard'
import SuggestionCard from '../components/automation/SuggestionCard'
import AgenticWorkflow from '../components/automation/AgenticWorkflow'
import { getAutomationArchitecture } from '../services/api'
import AgenticDeploymentFlow from '../components/automation/AgenticDeploymentFlow'

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
  const [architectureData, setArchitectureData] = useState(null)
  const [archLoading, setArchLoading] = useState(true)
  const [archError, setArchError] = useState(null)

  useEffect(() => {
    const data = sessionStorage.getItem(`suggestion_${id}`)
    if (data) {
      const parsed = JSON.parse(data)
      setSuggestion(parsed)

      // Read the cached analysis data from sessionStorage
      if (parsed.analysisId) {
        const analysisData = sessionStorage.getItem(`analysis_${parsed.analysisId}`)
        if (analysisData) {
          setProcessData(JSON.parse(analysisData))
        }
      }
    }

    return () => { }
  }, [id])

  const lastArchFetchedId = useRef(null)

  // Fetch architecture data from the API
  useEffect(() => {
    if (!id || lastArchFetchedId.current === id) return
    setArchLoading(true)
    lastArchFetchedId.current = id
    getAutomationArchitecture(id)
      .then(json => {
        // Handle both nested and flat API structures
        const data = json?.agent_cluster_architecture || (json?.nodes ? json : null);
        setArchitectureData(data)
        setArchError(null)
      })
      .catch(err => {
        console.warn('Architecture API fetch failed:', err)
        setArchitectureData(null)
        setArchError(err.message || 'Failed to load architecture data')
        lastArchFetchedId.current = null // Allow retry on error
      })
      .finally(() => setArchLoading(false))
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
            <div className="w-px h-5 bg-white" />
            <ChevronDown size={19} className="text-white -mt-2" />
          </div>
        </div>

        {/* Suggestion Card */}
        <div
          className="grid grid-cols-1 gap-4 opacity-0 animate-slide-up"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <SuggestionCard suggestion={suggestion} index={0} hideChip />
        </div>
        {/* Agentic Workflow Card */}
        <AgenticWorkflow suggestionId={id} />

        {/* Architecture Card */}
        <AgentArchitectureCard
          architectureData={architectureData}
          archLoading={archLoading}
          archError={archError}
        />

        {/* Deployment Model Card */}
        <DeploymentModelCard suggestionId={id} />
      </div>
    </div>
  )
}

function CardShell({ title, subtitle, icon: Icon, children, loading, error }) {
  if (loading) {
    return (
      <div className="card p-8 border-brand-500/20 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Icon size={20} className="text-brand-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white/90">{title}</h2>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
          </div>
          <p className="text-sm text-white/40 animate-pulse">Fetching {title.toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 border-brand-500/20 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Icon size={20} className="text-brand-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white/90">{title}</h2>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">Failed to Load {title}</p>
            <p className="text-xs text-white/30 max-w-xs leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-8 border-brand-500/20 bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:border-brand-500/30">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Icon size={20} className="text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white/90 uppercase tracking-tight">{title}</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function AgentArchitectureCard({ architectureData, archLoading, archError }) {
  if (!archLoading && !archError && !architectureData) return null

  const erpModule = architectureData?.erp_module || 'ERP Module'
  const operatingModel = architectureData?.operating_model || '—'
  const architectureLayers = architectureData?.architecture_layers || []
  const erpContext = architectureData?.erp_context || []

  return (
    <CardShell
      title="Agent Cluster Architecture"
      subtitle={`${erpModule} · ${operatingModel} Agent`}
      icon={Cpu}
      loading={archLoading}
      error={archError}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Architecture Layers */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-brand-400 uppercase tracking-[0.2em]">
              Layered Execution Model
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-5">
            {architectureLayers.map((layer, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center pt-1">
                  <div className="text-[10px] font-bold text-brand-500/80 bg-brand-500/10 w-7 h-7 rounded-lg flex items-center justify-center border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  {idx < architectureLayers.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-brand-500/20 to-transparent my-2" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/90 group-hover:text-brand-300 transition-colors">
                    {layer.title}
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed mt-1 group-hover:text-white/60 transition-colors">
                    {layer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ERP Context */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">
              ERP Integration Context
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-4">
            {erpContext.map((item, idx) => (
              <div key={idx} className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 hover:border-blue-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <CheckCircle2 size={12} className="text-blue-500/60" />
                  </div>
                  <p className="text-sm font-bold text-white/90">{item.title}</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed pl-9 group-hover:text-white/60 transition-colors">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  )
}

function DeploymentModelCard({ suggestionId }) {
  return (
    <CardShell
      title="Agent Deployment Model"
      subtitle="Technical Deployment Architecture"
      icon={Cpu}
    >
      <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40">
        <AgenticDeploymentFlow suggestionId={suggestionId} />
      </div>
     
    </CardShell>
  )
}

