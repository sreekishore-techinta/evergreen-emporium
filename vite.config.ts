// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// VITE_BASE_PATH is set by build:prod to /evergreen-emporium/ for Hostinger subdirectory.
// In dev (npm run dev) it is undefined, so base defaults to "/" which is correct for XAMPP.
const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: true,
    },
  },
  nitro: {
    output: {
      dir: ".output",
      publicDir: ".output/public",
    },
  },
  vite: {
    // Set base path so all asset URLs in index.html are prefixed correctly.
    // Dev: base = "/"  → assets at /assets/...
    // Prod: base = "/evergreen-emporium/"  → assets at /evergreen-emporium/assets/...
    base: basePath,
    server: {
      proxy: {
        // Forward ALL /api/* requests to XAMPP PHP backend in dev.
        "/api": {
          target: "http://localhost/evergreen-emporium",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: ".output/public",
    },
  },
});
