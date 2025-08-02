import html2pdf from 'html2pdf.js';

export default function generatePDF(content) {
  const element = document.createElement('div');
  element.innerHTML = `<h1>DailyDollars Plan</h1><pre>${content}</pre>`;
  html2pdf().from(element).save('DailyDollars_Plan.pdf');
}
