import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({command})=>({
  base: './',
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(),{name:"development-csp-preamble",transformIndexHtml(html){return command==='serve'?html.replace(/<meta http-equiv="Content-Security-Policy"[^>]+>\s*/g,''):html;}}],
}));
