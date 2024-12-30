import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: "0.0.0.0",
    port: 3000
  },
  css: {
    devSourcemap: true
  },
  resolve: {
    alias: {
      "@client": path.resolve(__dirname, "./src")
    }
  }
});
