import clsx from 'clsx'
import { User, Monitor, GitBranch, CheckSquare, Bell } from 'lucide-react'

const STEP_TYPE_ICONS = {
  manual: User,
  system: Monitor,
  decision: GitBranch,
  approval: CheckSquare,
  notification: Bell,
}

const STEP_TYPE_COLORS = {
  manual:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  system:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  decision:     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  approval:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  notification: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

function AutomationBar({ value }) {
  const color =
    value >= 80 ? 'bg-brand-500' :
    value >= 50 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/40">Automation Potential</span>
        <span className={clsx('text-xs font-semibold',
          value >= 80 ? 'text-brand-500' :
          value >= 50 ? 'text-amber-400' : 'text-red-400')}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function StepCard({ step, index, isLast }) {
  const Icon = STEP_TYPE_ICONS[step.step_type] || User
  const typeColor = STEP_TYPE_COLORS[step.step_type] || STEP_TYPE_COLORS.manual

  return (
    <div className="flex items-start gap-3 shrink-0 w-64">
      {/* Card */}
      <div className="card p-4 w-full hover:shadow-md transition-shadow duration-200 animate-slide-up"
        style={{ animationDelay: `${index * 60}ms` }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
            Step {step.step_number}
          </span>
          <span className={clsx('agent-tag border', typeColor)}>
            <Icon size={10} className="inline mr-1" />
            {step.actor}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white/90 text-sm leading-snug mb-1">
          {step.title}
        </h3>
        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
          {step.description}
        </p>

        {/* Step type */}
        <div className={clsx('mt-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border', typeColor)}>
          <Icon size={10} />{step.step_type}
        </div>

        <AutomationBar value={step.automation_potential} />

        {/* Duration */}
        {step.duration_estimate && (
          <p className="mt-2 text-xs text-white/30">
            ⏱ {step.duration_estimate}
          </p>
        )}
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center self-center shrink-0 mt-4">
          <div className="w-6 h-px bg-white/10" />
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-4
              border-t-transparent border-b-transparent border-l-white/10" />
        </div>
      )}
    </div>
  )
}
