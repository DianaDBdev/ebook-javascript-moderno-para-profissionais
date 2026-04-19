// vite.config.js — Seções 4.2 e 4.5: Configuração Vite completa para produção
// Capítulo 4 — Build Tools: Além do Webpack
//
// Este arquivo é um template comentado — copie e adapte ao seu projeto.
// Não é executável diretamente (requer um projeto Vite).

import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'path';
// import legacy        from '@vitejs/plugin-legacy';
// import compression   from 'vite-plugin-compression';
// import { visualizer } from 'rollup-plugin-visualizer';
// import { sentryVitePlugin } from '@sentry/vite-plugin';

// ─────────────────────────────────────────────────────────────
// Configuração mínima (seção 4.2) — funciona para 90% dos projetos
// ─────────────────────────────────────────────────────────────

// Versão mínima:
// export default defineConfig({ plugins: [react()] });

// ─────────────────────────────────────────────────────────────
// Configuração completa para produção (seção 4.5)
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),

    // Suporte a browsers legados (IE11+):
    // legacy({ targets: ['defaults', 'not IE 11'] }),

    // Bundle analyzer — gera stats.html com visualização do bundle:
    // visualizer({ open: true, gzipSize: true }),

    // Compressão gzip + brotli:
    // compression({ algorithm: 'gzip',           ext: '.gz' }),
    // compression({ algorithm: 'brotliCompress', ext: '.br' }),

    // Upload de source maps para Sentry:
    // sentryVitePlugin({ org: 'your-org', project: 'your-project', authToken: process.env.SENTRY_AUTH_TOKEN }),
  ],

  // Dev server (seção 4.2)
  server: {
    port: 3000,
    open: true, // Abre o browser automaticamente

    // Proxy para API (Caso Real — seção de migração)
    proxy: {
      '/api': {
        target:      'http://localhost:8000',
        changeOrigin: true
      }
    }
  },

  // Aliases de importação (Caso Real)
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, 'src'),
      // Se usar ESM puro (sem __dirname):
      // '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils':      path.resolve(__dirname, 'src/utils')
    }
  },

  // Build de produção (seção 4.5)
  build: {
    target:    'es2015',            // Browsers alvo — transpila features modernas
    minify:    'terser',            // 'terser' (menor) ou 'esbuild' (mais rápido)
    sourcemap: process.env.NODE_ENV !== 'production', // Full maps em staging, hidden em prod

    // Vendor splitting — melhora cache: libs raramente mudam
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],       // chunkar libs pesadas separadamente
          utils:  ['lodash-es', 'date-fns']
        }
      }
    },

    cssCodeSplit:          true,    // CSS por chunk (não um arquivo gigante)
    chunkSizeWarningLimit: 1000,    // Avisa se chunk > 1 MB
    reportCompressedSize:  false,   // Desligar para builds mais rápidos no CI
    assetsInlineLimit:     4096,    // Assets < 4 KB viram base64 inline (zero req)
  },

  // Constantes substituídas em build time
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },

  // Config de testes (Vitest — Capítulo 8)
  test: {
    environment:  'jsdom',
    setupFiles:   './src/test/setup.js',
  },
});

// ─────────────────────────────────────────────────────────────
// Notas importantes (seção 4.2)
// ─────────────────────────────────────────────────────────────

// ESTRUTURA de projeto Vite:
//   my-app/
//   ├── index.html          ← Entry point (na RAIZ — não em public/)
//   ├── vite.config.js
//   ├── src/
//   │   ├── main.js         ← Referenciado pelo index.html
//   │   └── App.jsx
//   └── public/             ← Assets estáticos (não processados)
//
// O index.html referencia o JS com type="module":
//   <script type="module" src="/src/main.js"></script>

// VARIÁVEIS DE AMBIENTE (seção 4.5):
//   # .env
//   VITE_API_URL=https://api.example.com   ← EXPOSTO ao client
//   DATABASE_URL=postgres://...             ← NÃO exposto (sem prefixo VITE_)
//
//   // Uso no código:
//   console.log(import.meta.env.VITE_API_URL);

// SOURCE MAPS (seção 4.7):
//   sourcemap: true      → arquivo .map separado
//   sourcemap: 'inline'  → embutido no bundle (arquivo maior)
//   sourcemap: 'hidden'  → gera .map mas não referencia no bundle
//                          use com Sentry em produção — nunca exponha publicamente
