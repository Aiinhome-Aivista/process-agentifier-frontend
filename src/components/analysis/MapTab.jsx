import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StepCard from './StepCard'
import AutomationChart from '../charts/AutomationChart'
import { usePDF } from '../../context/PdfContext'
import clsx from 'clsx'


export default function MapTab({ steps }) {
  const scrollRef = useRef()
  const isPDF = usePDF()

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  if (isPDF) {
    return (
      <div className="pdf-section">
        <div>
          <h3 className="pdf-atomic text-lg font-bold text-gray-900 mb-6 border-b pb-2">Process Step Breakdown</h3>
          <div className="space-y-4">
            {steps?.map((step, i) => (
              <div key={i} className="pdf-atomic flex gap-6 pb-4 border-b border-gray-100 last:border-0 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-300 text-base shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-bold text-gray-900">{step.title}</h4>
                    <span className="text-[10px] font-black uppercase text-brand-600">
                      {step.automation_potential}% Potential
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] uppercase font-bold text-gray-400">
                    <span>{step.type}</span>
                    <span>•</span>
                    <span>{step.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-10 pdf-atomic">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Automation Potential Variance</h3>
          <div className="chart-container-pdf">
            <AutomationChart steps={steps} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Step cards with nav arrows */}
      <div className="relative">
        {!isPDF && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10
                flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} className="text-white/60" />
          </button>
        )}

        <div
          ref={scrollRef}
          className={clsx(
            "flex items-start gap-4 pb-4 scroll-smooth scrollbar-thin px-2",
            isPDF ? "flex-wrap overflow-visible" : "overflow-x-auto"
          )}
          style={{ scrollbarWidth: 'thin' }}
        >
          {steps?.map((step, i) => (
            <div key={step.id || i} className={isPDF ? "w-[calc(50%-16px)]" : ""}>
              <StepCard
                step={step}
                index={i}
                isLast={i === steps.length - 1}
              />
            </div>
          ))}
        </div>

        {!isPDF && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10
                flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={16} className="text-white/60" />
          </button>
        )}
      </div>

      {/* Bar chart */}
      <AutomationChart steps={steps} />
    </div>
  )
}
