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
      </div>
    </div>
  )
}
