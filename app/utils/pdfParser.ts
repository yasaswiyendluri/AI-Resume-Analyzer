/**
 * Browser-only PDF text extraction.
 * pdfjs-dist must never be imported at module top-level (breaks Vercel/Node SSR).
 */

import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in the browser.");
  }

  if (!pdfjsPromise) {
   pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
     lib.GlobalWorkerOptions.workerSrc = workerSrc;
     return lib;
});
  }

  return pdfjsPromise;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText;
}
