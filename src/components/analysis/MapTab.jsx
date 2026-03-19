import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StepCard from './StepCard'
import AutomationChart from '../charts/AutomationChart'

export default function MapTab({ steps }) {
  const scrollRef = useRef()

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Step cards with nav arrows */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
              w-8 h-8 rounded-full bg-white shadow-md border border-gray-100
              flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-start gap-0 overflow-x-auto pb-4 scroll-smooth
              scrollbar-thin px-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {steps?.map((step, i) => (
            <StepCard
              key={step.id || i}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
              w-8 h-8 rounded-full bg-white shadow-md border border-gray-100
              flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Bar chart */}
      <AutomationChart steps={steps} />
    </div>
  )
}
