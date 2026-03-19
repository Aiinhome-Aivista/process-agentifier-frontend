import SuggestionCard from '../automation/SuggestionCard'
import { Zap } from 'lucide-react'

export default function AutomationTab({ suggestions }) {
  if (!suggestions?.length) {
    return (
      <div className="animate-fade-in text-center py-16">
        <Zap size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">No automation suggestions generated yet.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-brand-400" fill="currentColor" />
          <h2 className="text-base font-semibold text-gray-800">
            {suggestions.length} Automation Opportunities
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 inline-block" />
            AI Agent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            System Integration
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            RPA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((s, i) => (
          <SuggestionCard key={s.id || i} suggestion={s} index={i} />
        ))}
      </div>
    </div>
  )
}
