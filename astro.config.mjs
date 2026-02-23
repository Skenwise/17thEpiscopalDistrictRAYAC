// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",

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

  adapter: node({
    mode: "standalone",
  }),
});
