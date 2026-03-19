import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSearch, BarChart3, Cpu } from 'lucide-react'
import FileUploader from '../components/upload/FileUploader'
import { analyzeFiles } from '../services/api'

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Deep Analysis',
    desc: 'Extract steps from complex documents',
    color: 'text-brand-500 bg-brand-50',
  },
  {
    icon: BarChart3,
    title: 'Visual Insights',
    desc: 'Interactive process maps and metrics',
    color: 'text-blue-500 bg-blue-50',
  },
  {
    icon: Cpu,
    title: 'Agentic Suggestions',
    desc: 'AI-driven automation opportunities',
    color: 'text-purple-500 bg-purple-50',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (files) => {
    setError('')
    setLoading(true)
    try {
      const result = await analyzeFiles(files)
      // Navigate to analysis page with result in state
      navigate(`/analysis/${result.process.id}`, { state: { result } })
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Let's Agentify Your{' '}
          <span className="text-brand-400">Process</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
          Upload your process documentation or ERP data dumps. Our AI will map your
          workflows and suggest agentic automations to boost productivity.
        </p>
      </div>

      {/* Uploader */}
      <FileUploader onAnalyze={handleAnalyze} loading={loading} />

      {error && (
        <div className="text-center text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card p-5 space-y-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
