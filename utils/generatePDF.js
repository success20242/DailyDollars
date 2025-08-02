import jsPDF from "jspdf";

export default async function generatePDF(text) {
  if (typeof window === "undefined") {
    // Prevent running on server side
    return;
  }

  try {
    // Try to dynamically import html2pdf.js
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Create a temporary element with some basic styling
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";
    element.textContent = text;

    // Generate and save PDF with html2pdf
    await html2pdf().from(element).save();
  } catch (error) {
    console.warn("html2pdf failed or not available, falling back to jsPDF", error);

    // Fallback to jsPDF plain text PDF
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 10, 10);
      doc.save("DailyDollars_Plan.pdf");
    } catch (jsPDFError) {
      console.error("jsPDF PDF generation failed:", jsPDFError);
    }
  }
}
