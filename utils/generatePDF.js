// utils/generatePDF.js

export default async function generatePDF(text) {
  if (typeof window === "undefined") {
    // Prevent running on server
    return;
  }

  try {
    // Dynamically import html2pdf only on client side
    const html2pdf = (await import("html2pdf.js")).default;

    // Create a temporary element to hold the text
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";
    element.textContent = text;

    // Generate and save PDF
    await html2pdf().from(element).save();
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
}
