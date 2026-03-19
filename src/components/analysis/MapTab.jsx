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
              <div key={i} className="pdf-atomic flex gap-6 relative">
                {/* Connector Line and Dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3 z-10" />
                  {i < steps.length - 1 && (
                    <div className="w-px bg-gray-200 flex-1 my-1" />
                  )}
                </div>

                {/* Card Content */}
                <div className="flex-1 pb-6 pt-0">
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black text-gray-900 leading-tight">{step.title}</h4>
                      <span className="text-[10px] font-black uppercase text-white bg-brand-600 px-3 py-1 rounded-full">
                        {step.automation_potential}% POTENTIAL
                      </span>
                    </div>
                    
                    <div className="flex gap-4 text-[10px] uppercase font-black text-gray-500 mb-3 tracking-widest">
                       <span className="text-brand-700">{step.actor}</span>
                       {step.step_type && (
                         <>
                           <span className="opacity-30">•</span>
                           <span>{step.step_type}</span>
                         </>
                       )}
                    </div>

                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {step.description}
                    </p>
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
