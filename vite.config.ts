import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    cssCodeSplit: false,

    rollupOptions: {
      input: {
        content: fileURLToPath(new URL('./src/content/index.tsx', import.meta.url)),
      },
      output: {
        entryFileNames: 'content.js',
        chunkFileNames: 'chunks/[name]-[hash].js',

        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith('.css'))) {
            return 'content.css';
          }

          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
