import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Table2, X, AlertCircle, Loader2 } from 'lucide-react'
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
  const [tab, setTab] = useState('erp') // 'docs' | 'erp'
  const [erpText, setErpText] = useState('')
  const [docText, setDocText] = useState('')
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
    if (files.length === 0) {
      setError('Please upload at least one file.');
      return;
    }

    // Only sending files as per request
    onAnalyze(files)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit mx-auto border border-white/5">
        <button onClick={() => setTab('docs')}
          className={clsx('tab-btn text-xs', tab === 'docs' ? 'tab-active' : 'tab-inactive')}>
          <FileText size={13} className="inline mr-1" />Process Docs
        </button>
        <button onClick={() => setTab('erp')}
          className={clsx('tab-btn text-xs', tab === 'erp' ? 'tab-active' : 'tab-inactive')}>
          <Table2 size={13} className="inline mr-1" />ERP Dumps
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer',
          'transition-all duration-300',
          dragging
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-white/10 bg-white/5 hover:border-brand-500/50 hover:bg-white/[0.08]'
        )}
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPTED}
          className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 shadow-lg
              flex items-center justify-center">
            <Upload size={22} className="text-white/20" />
          </div>
          <div>
            <p className="font-bold text-white/90">
              {tab === 'erp'
                ? 'Upload ERP CSV / Excel Dumps'
                : 'Upload Process Documentation'}
            </p>
            <p className="text-sm text-white/40 mt-1">
              {tab === 'erp'
                ? 'Drag and drop up to 20 CSV files from SAP, Oracle, NetSuite, etc.'
                : 'PDF, DOCX, or TXT process definition documents'}
            </p>
          </div>
          <div className="flex gap-3 text-xs text-white/20">
            {tab === 'erp'
              ? ['CSV', 'XLSX', 'XLS'].map(t => <FileTag key={t} label={t} />)
              : ['PDF', 'DOCX', 'TXT'].map(t => <FileTag key={t} label={t} />)}
          </div>
        </div>

        {/* Integrated Text Input */}
        {/* <div
          className="mt-8 px-4 w-full relative z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-1 mb-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              User Input
            </label>
          </div>
          <div className="relative group/text">
            <input
              type="text"
              value={tab === 'erp' ? erpText : docText}
              onChange={(e) => tab === 'erp' ? setErpText(e.target.value) : setDocText(e.target.value)}
              placeholder={tab === 'erp'
                ? "Paste raw CSV data or log exports here..."
                : "Describe the process steps, roles, and systems involved..."}
              className="w-full h-11 bg-white/[0.01] backdrop-blur-sm border border-white/10 rounded-xl px-4
                  text-sm text-white placeholder:text-white/10 outline-none
                  focus:border-brand-500/50 focus:bg-white/[0.015] transition-all font-medium"
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-focus-within/text:opacity-100 transition-opacity">
              <div className="w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.5)]" />
            </div>
          </div>
        </div> */}

      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {files.map(f => (
            <div key={f.name}
              className="flex items-center justify-between px-4 py-2.5 bg-white/5
                 rounded-xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md
                    bg-brand-500 text-black shrink-0">
                  {LABELS[getExt(f.name)] || 'FILE'}
                </span>
                <span className="text-sm text-white/80 truncate">{f.name}</span>
                <span className="text-xs text-white/20 shrink-0">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button onClick={() => removeFile(f.name)}
                className="ml-3 text-white/20 hover:text-white/50 transition-colors shrink-0">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20
            px-4 py-2.5 rounded-xl">
          <AlertCircle size={15} />{error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || files.length === 0}
        className="w-full btn-primary justify-center py-3 text-base disabled:opacity-40
            disabled:cursor-not-allowed shadow-xl shadow-brand-500/10"
      >
        {loading
          ? <><Loader2 size={18} className="animate-spin" />Analyzing Process...</>
          : <><Upload size={18} />Analyze Process</>}
      </button>
    </div>
  )
}

function FileTag({ label }) {
  return (
    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-[10px] tracking-wider uppercase">
      {label}
    </span>
  )
}
