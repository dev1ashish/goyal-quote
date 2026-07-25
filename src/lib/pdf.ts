"use client";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_W = 210;
const A4_H = 297;

/**
 * Render the letterhead DOM node to a single-page A4 PDF.
 * Content is scaled to FIT ONE PAGE — it never splits across pages.
 */
export async function generatePdf(el: HTMLElement, fileName: string) {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const img = canvas.toDataURL("image/jpeg", 0.93);

  const ratio = canvas.height / canvas.width;
  let w = A4_W;
  let h = A4_W * ratio;
  if (h > A4_H) {
    // taller than one page: shrink to fit, centered horizontally
    h = A4_H;
    w = A4_H / ratio;
  }
  const x = (A4_W - w) / 2;
  doc.addImage(img, "JPEG", x, 0, w, h);
  doc.setProperties({ title: fileName });
  return { doc, fileName: `${fileName}.pdf` };
}

export async function downloadPdf(el: HTMLElement, fileName: string) {
  const { doc, fileName: fn } = await generatePdf(el, fileName);
  doc.save(fn);
}

/** Share the PDF via the device share sheet (WhatsApp, email…); falls back to download. */
export async function sharePdf(el: HTMLElement, fileName: string, text: string) {
  const { doc, fileName: fn } = await generatePdf(el, fileName);
  const blob = doc.output("blob");
  const file = new File([blob], fn, { type: "application/pdf" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName, text });
      return "shared" as const;
    } catch {
      // user cancelled the share sheet — do nothing
      return "cancelled" as const;
    }
  }
  doc.save(fn);
  return "downloaded" as const;
}
