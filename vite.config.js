import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "AntdSpreadsheetImport",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"]
    },

    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "antd",
        "xlsx",
        "@ant-design/icons"
      ],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "jsxRuntime",
          "react-dom": "ReactDOM",
          antd: "antd",
          xlsx: "XLSX",
          "@ant-design/icons": "AntIcons"
        }
      }
    }
  }
});
