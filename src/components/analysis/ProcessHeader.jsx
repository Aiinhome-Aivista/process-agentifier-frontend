import { useState, useEffect } from 'react'
import { CheckCircle2, QrCode } from 'lucide-react'
import clsx from 'clsx'

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
    <span className="text-5xl font-black text-brand-400 tabular-nums leading-none">
      {display}%
    </span>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'erp', label: 'ERP Context' },
  { id: 'map', label: 'Map' },
  { id: 'automation', label: 'Automation' },
]

export default function ProcessHeader({ process, activeTab, onTabChange }) {
  return (
    <div className="space-y-4">
      {/* Main card */}
      <div className="card p-6 flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-brand-400" />
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest">
              Analysis Complete
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {process.title}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            {process.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
            Automation Score
          </p>
          <div className="flex items-center gap-2 justify-end">
            <AnimatedScore target={process.automation_score} />
            <QrCode size={20} className="text-gray-300" />
          </div>
          {process.erp_system && (
            <p className="text-xs text-gray-400 mt-1">ERP: {process.erp_system}</p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx('tab-btn', activeTab === tab.id ? 'tab-active' : 'tab-inactive')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
