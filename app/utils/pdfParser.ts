/**
 * Browser-only PDF text extraction.
 * pdfjs-dist is loaded lazily so it never ends up in a server/SSR graph.
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

export interface PdfText {
  text: string;
  pageCount: number;
}

export async function extractTextFromPDF(file: File): Promise<PdfText> {
  const pdfjsLib = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "PasswordException") {
      throw new Error("This PDF is password-protected. Remove the password and try again.");
    }
    if (name === "InvalidPDFException") {
      throw new Error("This file doesn't look like a valid PDF.");
    }
    throw new Error("Couldn't open this PDF. Try re-exporting it from your editor.");
  }

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    let pageText = "";
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform?.[5] as number | undefined;
      // Start a new line when the baseline moves noticeably, even if hasEOL is missing.
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 2 && !pageText.endsWith("\n")) {
        pageText += "\n";
      } else if (pageText && !pageText.endsWith("\n") && !pageText.endsWith(" ") && item.str && !item.str.startsWith(" ")) {
        pageText += " ";
      }
      pageText += item.str;
      if (item.hasEOL) pageText += "\n";
      if (y !== undefined) lastY = y;
    }
    pages.push(pageText.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
  }

  await pdf.destroy();
  return { text: pages.join("\n\n"), pageCount: pdf.numPages };
}
