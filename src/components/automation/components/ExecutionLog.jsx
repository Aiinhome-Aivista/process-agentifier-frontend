import React from "react";

export default function ExecutionLog({ log, logRef, currentStep, totalSteps }) {
  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-400">
            execution log
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-bold">
            {currentStep >= 0 ? `step ${currentStep + 1}/${totalSteps}` : "—"}
          </div>
        </div>

        <div
          ref={logRef}
          className="h-[260px] overflow-y-auto text-[11px] font-mono space-y-1 pr-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {log.length === 0 && (
            <div className="text-slate-400 italic font-medium">
              $ awaiting agent run…
              <span className="inline-block w-1.5 h-3 ml-1 bg-slate-300 animate-pulse align-middle" />
            </div>
          )}

          {log.map((line, i) => {
            const isDone = line.startsWith("◆");
            const isNode = line.startsWith("●");
            const isEdge = line.startsWith("↳");

            return (
              <div
                key={i}
                className={`flex gap-2 ${isDone
                  ? "text-sky-600 font-bold"
                  : isNode
                    ? "text-slate-800 font-semibold"
                    : isEdge
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                style={{ animation: "fadeSlide 0.25s ease" }}
              >
                <span className="text-slate-300 select-none w-5 text-right font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 break-words whitespace-pre-wrap">{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
