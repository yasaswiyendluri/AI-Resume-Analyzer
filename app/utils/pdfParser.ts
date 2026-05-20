/**
 * Browser-only PDF text extraction.
 * pdfjs-dist must never be imported at module top-level (breaks Vercel/Node SSR).
 */

const PDFJS_VERSION = "3.11.174";
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.js");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in the browser.");
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.js").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
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
