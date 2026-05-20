import type { Config } from "@react-router/dev/config";

export default {
  // App is fully client-driven (PDF parsing, analysis). Avoids pdfjs-dist on Vercel serverless.
  ssr: false,
} satisfies Config;
