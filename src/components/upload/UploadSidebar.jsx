import clsx from 'clsx'
import { TABS } from './constants'

export default function UploadSidebar({ tab, setTab, setFiles, setUserInput }) {
  return (
    <div className="relative w-[300px] bg-white/[0.01] border-r border-white/10 p-5 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-100 fill-mode-both">
      <div className="px-3 mb-6">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Data Payloads</h3>
      </div>
      <div className="space-y-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
            }}
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
  );
}
