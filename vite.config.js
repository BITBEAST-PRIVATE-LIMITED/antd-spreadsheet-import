import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["excel-importer"]
  },
  build: {
    lib: {
      entry: "src/index.js",
      name: "ExcelImporter",
      fileName: "excel-importer",
      formats: ["es", "umd"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "antd", "xlsx"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          antd: "antd",
          xlsx: "XLSX"
        }
      }
    }
  }
});
