import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import AutomationTab from "../analysis/AutomationTab";
import ERPContextTab from "../analysis/ERPContextTab";
import MapTab from "../analysis/MapTab";
import OverviewTab from "../analysis/OverviewTab";


export default function ExportPDF() {
  const pdfRef = useRef();

  const handleDownload = async () => {
    const element = pdfRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("report.pdf");
  };

  return (
    <div>
      <button onClick={handleDownload}>Download PDF</button>

      {/* Hidden container */}
      <div ref={pdfRef} style={{ padding: "20px", background: "#fff" }}>
        <AutomationTab />
        <ERPContextTab />
        <MapTab />
        <OverviewTab />
      </div>
    </div>
  );
}