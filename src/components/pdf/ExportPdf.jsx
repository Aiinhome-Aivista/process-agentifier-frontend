import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2, } from "lucide-react";
import { PDFProvider } from "../../context/PdfContext";

import AutomationTab from "../analysis/AutomationTab";
import ERPContextTab from "../analysis/ERPContextTab";
import MapTab from "../analysis/MapTab";
import OverviewTab from "../analysis/OverviewTab";

export default function ExportPDF({ data }) {
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef();

  const { process, steps, suggestions, erp_modules, key_insights, top_automation_targets } = data;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const element = pdfRef.current;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      const usableHeightMm = pageHeight - (2 * margin);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const sections = element.querySelectorAll('.pdf-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const sectionWidthPx = canvas.width;
        const sectionHeightPx = canvas.height;
        const pxPerMm = sectionWidthPx / contentWidth;
        const usableHeightPx = usableHeightMm * pxPerMm;

        let yOffsetPx = 0;
        let isFirstSlice = true;

        while (yOffsetPx < sectionHeightPx) {
          if (!isFirstSlice || i > 0) pdf.addPage();
          
          const sliceHeightPx = Math.min(usableHeightPx, sectionHeightPx - yOffsetPx);
          
          // Create a temporary canvas for this specific page slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sectionWidthPx;
          sliceCanvas.height = sliceHeightPx;
          
          const ctx = sliceCanvas.getContext('2d');
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          
          // Draw just the part of the image we want for this page
          ctx.drawImage(
            canvas,
            0, yOffsetPx, sectionWidthPx, sliceHeightPx, // Source coordinates
            0, 0, sectionWidthPx, sliceHeightPx        // Destination coordinates
          );
          
          const sliceImgData = sliceCanvas.toDataURL("image/png");
          const sliceHeightMm = sliceHeightPx / pxPerMm;
          
          pdf.addImage(sliceImgData, "PNG", margin, margin, contentWidth, sliceHeightMm);
          
          yOffsetPx += usableHeightPx;
          isFirstSlice = false;
        }
      }

      pdf.save(`${process.title?.replace(/\s+/g, "_") || "Process"}_Report.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isExporting}
        className="btn-primary px-4 py-2 h-10 shadow-lg shadow-brand-500/20"
        title="Export Analysis to PDF"
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin text-black" />

          </>
        ) : (
          <>
            <Download size={18} className="text-black" />

          </>
        )}
      </button>

      {/* Hidden container for PDF rendering */}
      <div
        style={{
          position: "fixed",
          zIndex: -100,
          top: 0,
          left: "-2000px",
          pointerEvents: "none",
          background: "#fff"
        }}
      >
        <div
          ref={pdfRef}
          className="pdf-report"
          style={{
            width: "800px",
            padding: "60px",
          }}
        >
          <PDFProvider value={true}>
            <div className="space-y-4">
              {/* COVER PAGE */}
              <div className="pdf-section min-h-[850px] flex flex-col justify-center pb-20 text-left px-10 mb-0">
                <div className="mb-12">
                   <p className="text-brand-600 font-black text-xs uppercase tracking-[0.4em] mb-4">Automation Intelligence Report</p>
                   <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
                     {process.title || "Process Analysis"}
                   </h1>
                 
                </div>
                
                <div className="max-w-2xl mb-16">
                  <p className="text-xl text-gray-600 leading-relaxed font-semibold">
                    {process.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-12 w-full bg-gray-50 p-10 rounded-[40px] border border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">Automation Score</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-7xl font-black text-brand-600">{process.automation_score}%</p>
                    </div>
                  </div>
                 
                </div>
              </div>



              {/* DETAILED CHAPTERS */}
              <section className="pdf-section pt-10">
                <h2 className="pdf-section-title">01. Overview or Insights</h2>
                <OverviewTab insights={key_insights} topTargets={top_automation_targets} />
              </section>

              <section className="pdf-section pt-10">
                <h2 className="pdf-section-title">02. ERP Integration Architecture</h2>
                <ERPContextTab erpModules={erp_modules} process={process} />
              </section>

              <section className="pdf-section pt-10">
                <h2 className="pdf-section-title">03. Dimensional Process Mapping</h2>
                <MapTab steps={steps} />
              </section>

              <section className="pdf-section pt-10">
                <h2 className="pdf-section-title">04. Automation Opportunities</h2>
                <AutomationTab suggestions={suggestions} />
              </section>
            </div>
          </PDFProvider>
        </div>
      </div>
    </>
  );
}
