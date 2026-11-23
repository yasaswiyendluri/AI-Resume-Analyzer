import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Separate from vite.config.ts so the React Router plugin isn't loaded for unit tests.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { include: ["app/**/*.test.ts"] },
});
