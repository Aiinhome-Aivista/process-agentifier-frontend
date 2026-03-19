import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, Loader2, FileText } from 'lucide-react'
import { listProcesses } from '../services/api'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProcesses()
      .then(d => setProcesses(d.processes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-brand-400" />
        <h1 className="text-xl font-bold text-gray-900">Previous Analyses</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : processes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={32} className="mx-auto mb-3 text-gray-200" />
          <p>No analyses yet. Upload a file to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {processes.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/analysis/${p.id}`)}
              className="card p-4 flex items-center justify-between cursor-pointer
                  hover:shadow-md transition-all duration-150"
            >
              <div>
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.source_type?.toUpperCase()} · {new Date(p.created_at).toLocaleDateString()}
                  {p.erp_system && ` · ${p.erp_system}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-brand-400 tabular-nums">
                  {p.automation_score}%
                </span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
