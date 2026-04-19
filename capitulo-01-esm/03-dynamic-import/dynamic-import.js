// dynamic-import.js — Seção 1.4: Dynamic imports e code splitting
// Capítulo 1 — ESM: O Novo Padrão
//
// Execute: node exemplos/dynamic-import.js

// ─────────────────────────────────────────────────────────────
// 1. Problema: CommonJS carrega tudo na inicialização
// ─────────────────────────────────────────────────────────────

//   // CommonJS — tudo carregado na inicialização
//   const adminPanel = require('./admin-panel'); // 500 KB
//   const dashboard  = require('./dashboard');   // 300 KB
//   const reports    = require('./reports');     // 400 KB
//   // Usuário comum NUNCA acessa admin, mas carrega 500 KB à toa

// ─────────────────────────────────────────────────────────────
// 2. Solução: Dynamic import() — carrega só quando necessário
// ─────────────────────────────────────────────────────────────

//   button.addEventListener('click', async () => {
//     const adminPanel = await import('./admin-panel.js');
//     adminPanel.init();
//   });
//
// O arquivo admin-panel.js NÃO é carregado no início.
// Quando o usuário clica, o módulo é baixado, parseado e executado sob demanda.

// ─────────────────────────────────────────────────────────────
// 3. Carregamento condicional (ex: mobile vs desktop)
// ─────────────────────────────────────────────────────────────

async function loadEditor() {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    const { MobileEditor } = await import('./mobile-editor.js').catch(() => ({
      MobileEditor: class { start() { console.log('[demo] MobileEditor iniciado'); } },
    }));
    return new MobileEditor();
  } else {
    const { DesktopEditor } = await import('./desktop-editor.js').catch(() => ({
      DesktopEditor: class { start() { console.log('[demo] DesktopEditor iniciado'); } },
    }));
    return new DesktopEditor();
  }
}

// ─────────────────────────────────────────────────────────────
// 4. Code splitting automático com bundlers
// ─────────────────────────────────────────────────────────────

// Quando você usa dynamic imports, o Vite cria chunks separados:
//
//   dist/
//     main.js           (50 KB)
//     admin-chunk.js    (500 KB)  ← Só carrega para admins

// ─────────────────────────────────────────────────────────────
// 5. Lazy loading de rotas com React.lazy (seção 1.4 do livro)
// ─────────────────────────────────────────────────────────────

// import { lazy, Suspense } from 'react';
//
// const HeavyChart = lazy(() => import('./HeavyChart.js'));
//
//   function Dashboard() {
//     return (
//       <Suspense fallback={<div>Carregando gráfico...</div>}>
//         <HeavyChart data={data} />
//       </Suspense>
//     );
//   }

// ─────────────────────────────────────────────────────────────
// 6. Preload estratégico — inicia download no mouseenter
// ─────────────────────────────────────────────────────────────

//   // Começa a carregar quando o mouse passa sobre o botão
//   button.addEventListener('mouseenter', () => {
//     import('./admin-panel.js'); // Não aguarda — apenas inicia o download
//   });
//
//   // Quando clica, provavelmente já está no cache
//   button.addEventListener('click', async () => {
//     const admin = await import('./admin-panel.js');
//     admin.show();
//   });
//
// 💡 Resultado: percepção de instantaneidade para o usuário.

// ─────────────────────────────────────────────────────────────
// 7. Top-level await com dynamic import (seção 1.5 / 2.5)
// ─────────────────────────────────────────────────────────────

//   const env    = process.env.NODE_ENV || 'development';
//   const config = (await import(`./config.${env}.js`)).default;
//   // top-level await — ver detalhes na seção 2.5

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
const editor = await loadEditor();
editor.start();
