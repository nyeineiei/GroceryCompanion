import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import shadcnThemeJson from '@replit/vite-plugin-shadcn-theme-json';
import { resolve, dirname } from 'path';
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal';
import { fileURLToPath } from 'url';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorModal(),
    shadcnThemeJson(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
  root: resolve(__dirname, "client"),
  build: {
    outDir: resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
