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
  manual:       'bg-amber-50 text-amber-700 border-amber-200',
  system:       'bg-blue-50 text-blue-700 border-blue-200',
  decision:     'bg-purple-50 text-purple-700 border-purple-200',
  approval:     'bg-orange-50 text-orange-700 border-orange-200',
  notification: 'bg-teal-50 text-teal-700 border-teal-200',
}

function AutomationBar({ value }) {
  const color =
    value >= 80 ? 'bg-brand-400' :
    value >= 50 ? 'bg-amber-400' : 'bg-red-300'
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Automation Potential</span>
        <span className={clsx('text-xs font-semibold',
          value >= 80 ? 'text-brand-500' :
          value >= 50 ? 'text-amber-600' : 'text-red-500')}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Step {step.step_number}
          </span>
          <span className={clsx('agent-tag border', typeColor)}>
            <Icon size={10} className="inline mr-1" />
            {step.actor}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
          {step.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
          {step.description}
        </p>

        {/* Step type */}
        <div className={clsx('mt-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border', typeColor)}>
          <Icon size={10} />{step.step_type}
        </div>

        <AutomationBar value={step.automation_potential} />

        {/* Duration */}
        {step.duration_estimate && (
          <p className="mt-2 text-xs text-gray-400">
            ⏱ {step.duration_estimate}
          </p>
        )}
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center self-center shrink-0 mt-4">
          <div className="w-6 h-px bg-gray-300" />
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-4
              border-t-transparent border-b-transparent border-l-gray-300" />
        </div>
      )}
    </div>
  )
}
