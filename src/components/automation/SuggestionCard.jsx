import clsx from 'clsx'
import { Cpu, Shield, Zap, ArrowRight } from 'lucide-react'

const AGENT_TYPE_META = {
  system_integration:   { label: 'System Integration', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rpa:                  { label: 'RPA',                 color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ai_agent:             { label: 'AI Agent',            color: 'bg-brand-50 text-brand-600 border-brand-200' },
  workflow_automation:  { label: 'Workflow',            color: 'bg-amber-50 text-amber-700 border-amber-200' },
  communication_agent:  { label: 'Comm Agent',         color: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const ROI_COLORS = {
  high:   'text-brand-500',
  medium: 'text-amber-500',
  low:    'text-gray-400',
}

const EFFORT_COLORS = {
  low:    'bg-brand-50 text-brand-600',
  medium: 'bg-amber-50 text-amber-700',
  high:   'bg-red-50 text-red-600',
}

export default function SuggestionCard({ suggestion, index }) {
  const meta = AGENT_TYPE_META[suggestion.agent_type] || AGENT_TYPE_META.workflow_automation

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}>

      {/* Top-right badge icon */}
      <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-brand-400
          flex items-center justify-center shadow-sm">
        <Cpu size={16} className="text-white" />
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest">
          Agentic Suggestion ⚡
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base leading-snug pr-10 mb-2">
        {suggestion.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">
        {suggestion.description}
      </p>

      {/* Implementation hint */}
      {/* <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4 text-xs text-gray-600 flex items-start gap-2">
        <ArrowRight size={12} className="mt-0.5 shrink-0 text-brand-400" />
        <span>{suggestion.implementation}</span>
      </div> */}

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={clsx('agent-tag border text-xs', meta.color)}>
          {meta.label}
        </span>
        <span className={clsx('agent-tag text-xs', EFFORT_COLORS[suggestion.effort_level])}>
          {suggestion.effort_level} effort
        </span>
        <span className="agent-tag bg-gray-100 text-gray-600 text-xs">
          {suggestion.execution_speed} execution
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <Metric
          icon={<Shield size={13} className="text-brand-400" />}
          label="Accuracy"
          value={`${suggestion.accuracy_estimate}%`}
          bold
        />
        <Metric
          icon={<Zap size={13} className="text-amber-400" />}
          label="ROI Impact"
          value={suggestion.roi_impact}
          valueClass={ROI_COLORS[suggestion.roi_impact]}
        />
      </div>

      {/* Technologies */}
      {suggestion.technologies?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestion.technologies.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md font-mono">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ icon, label, value, bold, valueClass }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={clsx('text-sm font-semibold', valueClass || 'text-gray-800', bold && 'text-brand-500')}>
          {value}
        </p>
      </div>
    </div>
  )
}
