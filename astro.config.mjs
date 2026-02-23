// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

export default defineConfig({
  output: "static",

  integrations: [
    tailwind(),
    react(),
  ],

  vite: {
    cacheDir: "node_modules/.cache/.vite",
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "zustand",
        "framer-motion",
        "date-fns",
        "clsx",
        "class-variance-authority",
        "tailwind-merge",
        "zod",
      ],
    },
  },

  devToolbar: {
    enabled: false,
  },

  server: {
    allowedHosts: true,
    host: true,
  },

  security: {
    checkOrigin: false,
  },

});
