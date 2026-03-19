import { Database, GitFork } from 'lucide-react'

function ModuleCard({ mod }) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
          {mod.module_name}
        </span>
        <span className="text-xs text-gray-400 font-mono shrink-0">
          {mod.source_file}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{mod.description}</p>

      {mod.tables_identified?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Tables / Entities</p>
          <div className="flex flex-wrap gap-1.5">
            {mod.tables_identified.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700
                  rounded-md font-mono border border-blue-100">{t}</span>
            ))}
          </div>
        </div>
      )}

      {mod.fields_identified?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Fields Identified</p>
          <div className="flex flex-wrap gap-1.5">
            {mod.fields_identified.slice(0, 12).map(f => (
              <span key={f} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500
                  rounded-md font-mono">{f}</span>
            ))}
            {mod.fields_identified.length > 12 && (
              <span className="text-xs text-gray-400">
                +{mod.fields_identified.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ERPContextTab({ erpModules, process }) {
  const hasModules = erpModules?.length > 0

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Module Identification */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-brand-400" />
          <h2 className="text-base font-semibold text-gray-800">Module Identification</h2>
        </div>
        {hasModules ? (
          <div className="space-y-3">
            {erpModules.map((mod, i) => <ModuleCard key={i} mod={mod} />)}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <Database size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              No ERP modules identified in the uploaded files.
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Upload ERP data dumps for module-level analysis.
            </p>
          </div>
        )}
      </div>

      {/* Logical Relationships */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitFork size={16} className="text-brand-400" />
          <h2 className="text-base font-semibold text-gray-800">Logical Relationships</h2>
        </div>
        {hasModules ? (
          <div className="card p-5 space-y-3">
            {erpModules.map((mod, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-brand-300 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{mod.module_name}</p>
                  <p className="text-xs text-gray-400">{mod.erp_system} · {mod.description?.slice(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <GitFork size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Logical relationships will appear here once ERP modules are identified.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
