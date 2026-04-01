import { useRef, useState } from 'react'
import { ChevronRight, ChevronLeft, TrendingUp, ArrowLeft, Zap } from 'lucide-react'
import { usePDF } from '../../context/PdfContext'
import clsx from 'clsx'
import StepCard from './StepCard'
import AutomationChart from '../charts/AutomationChart'
import SuggestionCard from '../automation/SuggestionCard'


const IMPACT_COLORS = {
  high: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-white/5 text-white/40 border-white/10',
}

const CATEGORY_ICONS = {
  automation: '⚡',
  bottleneck: '🔴',
  integration: '🔗',
  risk: '⚠️',
  opportunity: '✨',
}

function InsightCard({ insight }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10
        transition-all duration-150 border border-white/5 hover:border-white/10">
      <ChevronRight size={14} className="mt-0.5 shrink-0 text-brand-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 leading-relaxed">{insight.text}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs">{CATEGORY_ICONS[insight.category] || '•'}</span>
          <span className={clsx('text-xs px-2 py-0.5 rounded-full border', IMPACT_COLORS[insight.impact])}>
            {insight.impact} impact
          </span>
        </div>
      </div>
    </div>
  )
}

function TopTarget({ item, rank }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs text-white/20 font-mono w-4">{rank}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90 truncate">{item.title}</p>
          <p className="text-xs text-white/40">{item.actor}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-brand-500 shrink-0 ml-4 tabular-nums">
        {item.automation_potential}%
      </span>
    </div>
  )
}

export default function OverviewTab({ insights, topTargets, steps, suggestions }) {
  const isPdf = usePDF()
  const scrollRef = useRef()
  const [selectedStep, setSelectedStep] = useState(null)

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  const stepSuggestions = selectedStep
    ? (suggestions?.filter(s => s.step_key === selectedStep.id) || [])
    : []

  if (isPdf) {
    return (
      <div className="pdf-section">
        <div className="mb-10">
          <h3 className="pdf-atomic text-lg font-bold text-gray-900 mb-6 border-b pb-2">Key Process Insights</h3>
          <div className="space-y-4">
            {insights?.map((insight, i) => (
              <div key={i} className="pdf-atomic flex gap-4 items-start pb-2">
                <span className="font-bold text-brand-600">0{i + 1}.</span>
                <div>
                  <p className="text-gray-900 font-medium">{insight.text}</p>
                  <p className="text-xs text-brand-600 font-bold uppercase mt-1">
                    {insight.category} · {insight.impact} impact
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="pdf-atomic text-lg font-bold text-gray-900 mb-6 border-b pb-2">Top Automation Targets</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border text-[10px] uppercase font-bold text-gray-500">Rank</th>
                <th className="p-2 border text-[10px] uppercase font-bold text-gray-500">Title / Process</th>
                <th className="p-2 border text-[10px] uppercase font-bold text-gray-500">Actor</th>
                <th className="p-2 border text-[10px] uppercase font-bold text-gray-500 text-right">Potential</th>
              </tr>
            </thead>
            <tbody>
              {topTargets?.map((t, i) => (
                <tr key={i} className="pdf-atomic">
                  <td className="p-2 border text-sm text-gray-400 font-mono">{i + 1}</td>
                  <td className="p-2 border text-sm font-bold text-gray-900">{t.title}</td>
                  <td className="p-2 border text-sm text-gray-600">{t.actor}</td>
                  <td className="p-2 border text-sm font-black text-brand-600 text-right">{t.automation_potential}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PDF: Step Breakdown */}
        <div className="pdf-section mt-10">
          <h3 className="pdf-atomic text-lg font-bold text-gray-900 mb-6 border-b pb-2">Process Step Breakdown</h3>
          <div className="space-y-4">
            {steps?.map((step, i) => (
              <div key={i} className="pdf-atomic flex gap-6 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3 z-10" />
                  {i < steps.length - 1 && (
                    <div className="w-px bg-gray-200 flex-1 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6 pt-0">
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black text-gray-900 leading-tight">{step.title}</h4>
                      <span className="text-[10px] font-black uppercase text-white bg-brand-600 px-3 py-1 rounded-full">
                        {step.automation_potential}% POTENTIAL
                      </span>
                    </div>
                    <div className="flex gap-4 text-[10px] uppercase font-black text-gray-500 mb-3 tracking-widest">
                      <span className="text-brand-700">{step.actor}</span>
                      {step.step_type && (
                        <>
                          <span className="opacity-30">•</span>
                          <span>{step.step_type}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 pdf-atomic">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Automation Potential Variance</h3>
            <div className="chart-container-pdf">
              <AutomationChart steps={steps} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const left = insights?.slice(0, Math.ceil(insights.length / 2)) || []
  const right = insights?.slice(Math.ceil(insights.length / 2)) || []

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Process Map section */}
      {steps?.length > 0 && (
        <div className="space-y-6">

          {selectedStep ? (
            /* ── DETAIL VIEW ── */
            <div className="space-y-5">

              {/* Breadcrumb + back */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStep(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40
                      hover:text-white transition-colors group"
                >
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back
                </button>
                <span className="text-white/20">·</span>
                <nav className="flex items-center gap-1.5 text-xs text-white/30">
                  <span
                    onClick={() => setSelectedStep(null)}
                    className="hover:text-white/60 cursor-pointer transition-colors"
                  >
                    Process Steps Mapping
                  </span>
                  <ChevronRight size={11} className="text-white/20" />
                  <span className="text-brand-400 font-semibold truncate max-w-xs">
                    {selectedStep.title}
                  </span>
                </nav>
              </div>

              {/* Step summary pill */}
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl w-fit">
                <span className="text-xs font-mono text-white/30">Step {selectedStep.step_number}</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-sm font-semibold text-white/80">{selectedStep.title}</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-xs text-white/40">{selectedStep.actor}</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-xs font-bold text-brand-500">{selectedStep.automation_potential}% potential</span>
              </div>

              {/* Suggestions */}
              {stepSuggestions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-brand-500" fill="currentColor" />
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">
                      {stepSuggestions.length} Automation Suggestion{stepSuggestions.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stepSuggestions.map((s, i) => (
                      <SuggestionCard key={s.id || i} suggestion={s} index={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Zap size={28} className="text-white/10 mb-3" />
                  <p className="text-sm text-white/30">No automation suggestions for this step.</p>
                </div>
              )}
            </div>

          ) : (
            /* ── MAP VIEW ── */
            <>
              <h2 className="text-base font-semibold text-white/90">Process Steps Mapping</h2>

              <div className="relative">
                <button
                  onClick={() => scroll(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                      w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10
                      flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} className="text-white/60" />
                </button>

                <div
                  ref={scrollRef}
                  className="flex items-start gap-4 pb-4 scroll-smooth scrollbar-thin px-2 overflow-x-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {steps.map((step, i) => (
                    <StepCard
                      key={step.id || i}
                      step={step}
                      index={i}
                      isLast={i === steps.length - 1}
                      onClick={() => setSelectedStep(step)}
                    />
                  ))}
                </div>

                <button
                  onClick={() => scroll(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                      w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10
                      flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={16} className="text-white/60" />
                </button>
              </div>

              <AutomationChart steps={steps} />
            </>
          )}
        </div>
      )}
      {/* Overview row: insights + top targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Insights — 2/3 width */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-white/90 mb-4">Key Process Insights</h2>
          {insights?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No insights available.</p>
          )}
        </div>

        {/* Top Automation Targets — 1/3 width */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-500" />
            <h2 className="text-base font-semibold text-white/90">Top Automation Targets</h2>
          </div>
          <div className="card p-4">
            {topTargets?.length ? (
              topTargets.map((t, i) => <TopTarget key={i} item={t} rank={i + 1} />)
            ) : (
              <p className="text-sm text-white/40">No targets identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
