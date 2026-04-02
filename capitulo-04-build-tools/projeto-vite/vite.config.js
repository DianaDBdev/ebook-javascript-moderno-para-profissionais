// vite.config.js — Configuração essencial para produção
// Capítulo 4 — Vite 8 com Rolldown

import { defineConfig } from 'vite';

export default defineConfig({
  // ──────────────────────────────────────────────
  // Build de produção otimizado
  // ──────────────────────────────────────────────
  build: {
    target: 'es2020',          // suporte a navegadores modernos
    minify: 'oxc',             // Vite 8 usa Oxc por padrão (mais rápido que esbuild)
    sourcemap: true,           // necessário para debugging em produção
    chunkSizeWarningLimit: 500, // avisa chunks > 500KB

    rollupOptions: {
      output: {
        // Code splitting manual por categoria
        manualChunks: {
          vendor:  ['react', 'react-dom'],       // bibliotecas grandes separadas
          router:  ['react-router-dom'],
          // ui:   ['@radix-ui/...'],             // UI library separada
        },
      },
    },
  },

  // ──────────────────────────────────────────────
  // Dev server
  // ──────────────────────────────────────────────
  server: {
    port: 3000,
    open: true,                // abre o browser automaticamente

    proxy: {
      // Redireciona /api/* para o backend durante desenvolvimento
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // ──────────────────────────────────────────────
  // Aliases de importação (evita ../../.. no código)
  // ──────────────────────────────────────────────
  resolve: {
    alias: {
      '@':          '/src',
      '@components': '/src/components',
      '@hooks':     '/src/hooks',
      '@utils':     '/src/utils',
      '@types':     '/src/types',
    },
  },
});
