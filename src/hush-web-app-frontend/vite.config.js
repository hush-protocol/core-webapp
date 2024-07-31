/// <reference types="vitest" />
import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js',
  },
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
      {
        find:"@",
        replacement: fileURLToPath(
          new URL("./src", import.meta.url)
        ),
      }
      
    ],
  },
});
