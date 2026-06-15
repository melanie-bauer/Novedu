import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));
const testsPath = fileURLToPath(new URL("./tests", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
      "@tests": testsPath,
    },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            "@": srcPath,
            "@tests": testsPath,
          },
        },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.{test,spec}.ts"],
        },
      },
      {
        resolve: {
          alias: {
            "@": srcPath,
            "@tests": testsPath,
          },
        },
        test: {
          name: "browser",
          include: ["tests/browser/**/*.{test,spec}.{ts,tsx}"],
          deps: {
            optimizer: {
              client: {
                include: [
                  "vitest-browser-react",
                  "@copilotkit/react-core/v2",
                  "react-markdown",
                  "react-syntax-highlighter",
                  "react-syntax-highlighter/dist/esm/styles/prism",
                  "rehype-katex",
                  "remark-gfm",
                  "remark-math",
                ],
              },
            },
          },
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
