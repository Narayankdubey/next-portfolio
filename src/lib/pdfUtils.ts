import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    // Scroll into view to ensure rendering
    element.scrollIntoView();
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dataUrl = await toPng(element, {
      backgroundColor: "#111827", // match bg-gray-900
      cacheBust: true,
      pixelRatio: 1, // Prevent canvas size limits on large content
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        overflow: "visible",
        height: "auto",
        maxHeight: "none",
      },
      filter: (node) => {
        // Ignore elements with data-html2canvas-ignore attribute
        if (node instanceof HTMLElement && node.hasAttribute("data-html2canvas-ignore")) {
          return false;
        }
        return true;
      },
    });

    // Create PDF
    // Calculate aspect ratio to fit in PDF if needed, or just make PDF large enough
    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [img.width, img.height],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
    pdf.save(filename);
  } catch (error: any) {
    console.error("PDF generation failed:", error);
    throw new Error(error.message || "Unknown error during PDF generation");
  }
};
