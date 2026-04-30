import clsx from 'clsx'
import { Upload, Search, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import FileTag from './FileTag'

const HARDCODED_SOURCES = [
  { id: 1, title: "Salesforce - Sales Data & Analytics", desc: "Salesforce provides a comprehensive suite of tools for sales data analytics, CRM integration, and real-time reporting. It helps businesses track performance, forecast trends, and optimize sales strategies with AI-driven...", url: "https://www.salesforce.com/products/analytics/" },
  { id: 2, title: "HubSpot Sales Analytics", desc: "HubSpot offers sales analytics tools that integrate with CRM data to provide insights into sales performance, pipeline health, and revenue trends. It's useful for businesses looking to streamline sales processes and improv...", url: "https://www.hubspot.com/products/sales/sales-analytics" },
  { id: 3, title: "Tableau - Sales Data Visualization", desc: "Tableau specializes in visualizing sales data through interactive dashboards and reports. It helps sales teams and executives quickly identify trends, patterns, and outliers in their sales performance.", url: "https://www.tableau.com/solutions/sales" }
]

export default function UploadDropzone({ tab, userInput, setUserInput, onDrop, onDragOver, onDragLeave, inputRef, dragging, addFiles }) {
  const [isSearched, setIsSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSources, setSelectedSources] = useState([1, 2, 3])

  const handleSearch = () => {
    setIsSearching(true)
    setIsSearched(false)
    setTimeout(() => {
      setIsSearching(false)
      setIsSearched(true)
    }, 1500)
  }

  const toggleSource = (id) => {
    setSelectedSources(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="relative flex-1 flex flex-col">
      {tab === 'user' || tab === 'websearch' ? (
        <div key={tab} className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
          {tab === 'user' ? (
            <div className="w-full max-w-xl h-[220px] bg-white/[0.05] border border-white/20 rounded-2xl overflow-hidden focus-within:border-brand-500/50 focus-within:bg-white/[0.08] transition-all duration-300">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your process in detail here."
                className="w-full h-full bg-transparent p-6 text-sm text-white placeholder:text-brand-500/60 outline-none font-medium resize-none leading-relaxed scrollbar-custom"
              />
            </div>
          ) : (
            <div className="w-full max-w-2xl transition-all duration-500 space-y-4">
              {!isSearched && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    <Search size={23} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">Search the Web</p>
                    <p className="text-sm text-white/40">Find process information and best practices</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value)
                    if (isSearched && e.target.value === '') setIsSearched(false)
                  }}
                  placeholder="e.g. SAP procurement process, ERP order management..."
                  className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 outline-none font-medium focus:border-brand-500/50 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-[13px]"
                />
                <button
                  disabled={!userInput.trim() || isSearching}
                  onClick={handleSearch}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/10 disabled:text-brand-500/50 disabled:cursor-not-allowed border border-brand-500/30 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-black whitespace-nowrap"
                >
                  {isSearching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
                  <span>{isSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>

              {isSearching && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-brand-500/[0.02] border border-brand-500/20 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                     <Loader2 size={24} className="text-brand-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Researching Websites...</h3>
                    <p className="text-white/50 text-sm mt-1">Analyzing live web data and extracting insights</p>
                  </div>
                </div>
              )}

              {isSearched && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 text-brand-400 text-sm font-bold mb-4">
                    <CheckCircle2 size={16} />
                    <span>Fast Research completed!</span>
                  </div>
                  
                  <div className="space-y-3 max-h-[160px] overflow-y-auto scrollbar-custom pr-2">
                    {HARDCODED_SOURCES.map(s => (
                      <div key={s.id} className="p-4 border border-brand-500/30 bg-brand-500/[0.02] rounded-xl flex gap-4 hover:border-brand-500/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">{s.title}</h3>
                          <p className="text-white/60 text-sm mt-1 leading-relaxed line-clamp-2">{s.desc}</p>
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-brand-400 text-xs mt-2 inline-block hover:underline truncate max-w-full">{s.url}</a>
                        </div>
                        <div className="pt-1 shrink-0">
                          <div 
                            onClick={() => toggleSource(s.id)}
                            className={clsx(
                              "w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors border",
                              selectedSources.includes(s.id) ? "bg-brand-500 border-brand-500" : "bg-transparent border-white/20 hover:border-white/40"
                            )}
                          >
                            {selectedSources.includes(s.id) && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-black"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-brand-400 text-sm font-bold mt-4 cursor-pointer hover:text-brand-300 w-fit">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center"><ChevronDown size={14} /></div>
                    <span>5 more sources View</span>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div className="text-white/60 text-sm font-medium">8 sources selected</div>
                    <div className="flex items-center gap-3">
                      <button className="px-5 py-2 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors">Delete</button>
                      <button className="px-6 py-2 bg-brand-500 text-black font-bold rounded-xl hover:bg-brand-400 transition-colors">Import</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div key="upload" className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
          <div
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className="w-full max-w-xl h-[220px] relative group cursor-pointer transition-all duration-500 flex flex-col outline-none"
          >
            <div className={clsx(
              'relative flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-500',
              dragging ? 'border-brand-500 bg-brand-500/[0.08]' : 'border-white/20 bg-white/[0.05] hover:bg-white/[0.08]'
            )}>
              <input ref={inputRef} type="file" multiple accept={tab === 'erp' ? '.csv,.xlsx,.xls' : '.pdf,.docx,.doc,.txt'} className="hidden" onChange={e => addFiles(e.target.files)} />
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
    </div>
  );
}
