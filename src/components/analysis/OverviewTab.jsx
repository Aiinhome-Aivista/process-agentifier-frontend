import clsx from 'clsx'
import { ChevronRight, TrendingUp } from 'lucide-react'

const IMPACT_COLORS = {
  high:   'bg-brand-50 text-brand-600 border-brand-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-gray-50 text-gray-500 border-gray-200',
}

const CATEGORY_ICONS = {
  automation:   '⚡',
  bottleneck:   '🔴',
  integration:  '🔗',
  risk:         '⚠️',
  opportunity:  '✨',
}

function InsightCard({ insight }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-white
        hover:shadow-sm transition-all duration-150 border border-transparent hover:border-gray-100">
      <ChevronRight size={14} className="mt-0.5 shrink-0 text-brand-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
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
        <span className="text-xs text-gray-300 font-mono w-4">{rank}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
          <p className="text-xs text-gray-400">{item.actor}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-brand-400 shrink-0 ml-4 tabular-nums">
        {item.automation_potential}%
      </span>
    </div>
  )
}

export default function OverviewTab({ insights, topTargets }) {
  const left = insights?.slice(0, Math.ceil(insights.length / 2)) || []
  const right = insights?.slice(Math.ceil(insights.length / 2)) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Key Insights — 2/3 width */}
      <div className="lg:col-span-2">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Key Process Insights</h2>
        {insights?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No insights available.</p>
        )}
      </div>

      {/* Top Automation Targets — 1/3 width */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-brand-400" />
          <h2 className="text-base font-semibold text-gray-800">Top Automation Targets</h2>
        </div>
        <div className="card p-4">
          {topTargets?.length ? (
            topTargets.map((t, i) => <TopTarget key={i} item={t} rank={i + 1} />)
          ) : (
            <p className="text-sm text-gray-400">No targets identified.</p>
          )}
        </div>
      </div>
    </div>
  )
}
