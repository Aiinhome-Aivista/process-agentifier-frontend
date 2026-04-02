import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, Table2, X, AlertCircle, Loader2, ChevronRight, Plus } from 'lucide-react'
import clsx from 'clsx'

const ACCEPTED = '.pdf,.docx,.doc,.txt,.csv,.xlsx,.xls'
const LABELS = {
  pdf: 'PDF', docx: 'DOCX', doc: 'DOCX', txt: 'TXT',
  csv: 'CSV', xlsx: 'XLSX', xls: 'XLS',
}

function getExt(name) { return name.split('.').pop().toLowerCase() }

export default function FileUploader({ onAnalyze, loading }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(null) // null | 'docs' | 'erp' | 'user'
  const [userInput, setUserInput] = useState('')
  const inputRef = useRef()

  const addFiles = useCallback((incoming) => {
    setError('')
    const arr = Array.from(incoming)
    const valid = arr.filter(f => {
      const ext = getExt(f.name)
      return LABELS[ext]
    })
    if (valid.length !== arr.length) setError('Some files were skipped (unsupported type).')
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))].slice(0, 20)
    })
  }, [])

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const removeFile = (name) => setFiles(f => f.filter(x => x.name !== name))

  const handleSubmit = () => {
    if (tab === 'user' && !userInput) {
      setError('Please provide some input text.');
      return;
    }
    if (tab !== 'user' && tab !== null && files.length === 0) {
      setError('Please upload at least one file.');
      return;
    }
    if (tab === null) {
      setError('Please select an upload type first.');
      return;
    }

    onAnalyze(files, userInput)
  }

  const TABS = [
    { id: 'docs', label: 'Process Docs', icon: FileText, desc: 'PDF, Word, or TXT' },
    { id: 'erp', label: 'ERP Dumps', icon: Table2, desc: 'Excel or CSV data' },
    { id: 'user', label: 'User Input', icon: AlertCircle, desc: 'Detailed description' },
  ]

  return (
    <div className={clsx(
      "w-full mx-auto space-y-8 transition-all duration-700 ease-in-out",
      tab === null ? "max-w-2xl" : "max-w-4xl"
    )}>
      {/* Initial Upload Button Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setTab(tab === null ? 'docs' : null)}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold tracking-tight',
            'bg-brand-500 text-black shadow-lg shadow-brand-500/20 hover:bg-brand-400'
          )}
        >
          <Plus size={16} />
          <span>Upload</span>
        </button>
      </div>

      <div
        className={clsx(
          "flex transition-all duration-700 ease-in-out overflow-hidden shadow-2xl",
          tab === null
            ? "w-full border-2 border-dashed border-white/10 bg-white/5 rounded-2xl min-h-[250px] cursor-pointer hover:border-brand-500/50 hover:bg-white/[0.08]"
            : "relative bg-[#0d0d0d]/40 backdrop-blur-3xl border border-white/10 rounded-3xl min-h-[420px]"
        )}
      >
        {tab === null ? (
          <div
            onClick={() => setTab('docs')}
            className="w-full p-12 text-center flex flex-col items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex items-center justify-center">
              <Upload size={22} className="text-white/20 group-hover:text-brand-500 transition-colors" />
            </div>
            <div>
              <p className="font-bold text-white/90 text-lg">
                Upload multiple files <span className="text-white/20 font-normal">or</span> add user input
              </p>
              <p className="text-sm text-white/40 mt-1 max-w-md mx-auto leading-relaxed">
                Connect your process documentation or ERP exports to initiate deeper agentic analysis.
              </p>
            </div>
            <div className="flex gap-3 text-xs text-white/20">
              {['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'XLS'].map(t => <FileTag key={t} label={t} />)}
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar Glimmer */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <div className="relative w-[300px] bg-white/[0.01] border-r border-white/10 p-5 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-100 fill-mode-both">
              <div className="px-3 mb-6">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Data Payloads</h3>
              </div>
              <div className="space-y-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={clsx(
                      'w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-300 group relative',
                      tab === t.id
                        ? 'text-brand-500 bg-white/[0.03]'
                        : 'text-white/40 hover:bg-white/[0.02] hover:text-white/80'
                    )}
                  >
                    {tab === t.id && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-brand-500 rounded-r-full" />
                    )}
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
                      tab === t.id ? 'bg-brand-500/10' : 'bg-white/5'
                    )}>
                      <t.icon size={18} className={clsx(tab === t.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'font-bold text-sm tracking-tight',
                        tab === t.id ? 'text-white' : ''
                      )}>{t.label}</p>
                      <p className="text-[10px] opacity-40 font-medium truncate">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
              <div className="relative flex-1 flex flex-col">
                {tab === 'user' ? (
                  <div className="flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Describe your process in detail here."
                      className="w-full flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-brand-500/30 focus:bg-white/[0.04] transition-all duration-300 font-medium resize-none leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
                    <div
                      onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                      onClick={() => inputRef.current?.click()}
                      className="flex-1 relative group cursor-pointer transition-all duration-500 flex flex-col"
                    >
                      <div className={clsx(
                        'relative flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-500',
                        dragging ? 'border-brand-500 bg-brand-500/[0.08]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                      )}>
                        <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={e => addFiles(e.target.files)} />
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                          <Upload size={22} className="text-white/20 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">
                            {tab === 'erp' ? 'Upload ERP CSV / Excel Dumps' : 'Upload Process Documentation'}
                          </p>
                          <p className="text-sm text-white/40 mt-1 max-w-xs mx-auto">
                            {tab === 'erp'
                              ? 'Drag and drop up to 20 CSV files from SAP, Oracle, etc.'
                              : 'PDF, DOCX, or TXT process definition documents'}
                          </p>
                        </div>
                        <div className="flex gap-3 mt-4 text-xs text-white/20">
                          {tab === 'erp'
                            ? ['CSV', 'XLSX', 'XLS'].map(t => <FileTag key={t} label={t} />)
                            : ['PDF', 'DOCX', 'TXT'].map(t => <FileTag key={t} label={t} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 flex items-center gap-3 text-red-100 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
          {files.map(f => (
            <div key={f.name} className="flex items-center justify-between px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-md">{(LABELS[getExt(f.name)] || 'FILE').toUpperCase()}</span>
                <span className="text-sm font-bold text-white/80 truncate">{f.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(f.name); }} 
                className="text-white/10 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || (tab === 'user' ? !userInput : (tab !== null && files.length === 0))}
        className="w-full relative group overflow-hidden py-3 rounded-xl transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <div className={clsx(
          "absolute inset-0 bg-brand-500 transition-transform duration-500",
          loading ? "translate-y-full" : "translate-y-0"
        )} />
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center justify-center gap-3">
          {loading ? (
            <><Loader2 size={18} className="animate-spin text-black" /><span className="text-black font-bold">Analyzing Process...</span></>
          ) : (
            <><Upload size={18} className="text-black group-hover:-translate-y-1 transition-transform" /><span className="text-black font-bold">Analyze Process</span></>
          )}
        </div>
      </button>
    </div>
  )
}

function FileTag({ label }) {
  return (
    <span className="px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg font-black text-[9px] tracking-[0.1em] uppercase text-white/40 group-hover:border-brand-500/20 group-hover:text-brand-400 transition-colors duration-500">
      {label}
    </span>
  )
}

