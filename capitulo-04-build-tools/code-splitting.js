// code-splitting.js — Seções 4.2 e 4.5: Code splitting, lazy loading, assets
// Capítulo 4 — Build Tools: Além do Webpack
//
// Execute: node exemplos/code-splitting.js
// (Exemplos comentados que exigem browser/Vite são mostrados como referência)

// ─────────────────────────────────────────────────────────────
// SEÇÃO 4.2 — Como Vite funciona
// ─────────────────────────────────────────────────────────────

// WEBPACK/FERRAMENTAS ANTIGAS:
//   1. Você inicia o dev server
//   2. Bundler processa TUDO (pode levar 30s–2min)
//   3. Server inicia
//   4. Você pode desenvolver

// VITE:
//   1. Você inicia o dev server
//   2. Server inicia IMEDIATAMENTE (< 1s)
//   3. Bundler processa apenas o que você acessar
//   4. HMR instantâneo (< 50ms)

// COMO VITE CONSEGUE ISSO:
//   Em desenvolvimento: ESM nativo + esbuild
//     // Vite NÃO bundla em dev
//     // Serve arquivos usando ESM nativo do browser
//     import { Component } from './Component.jsx';
//     // Browser requisita Component.jsx diretamente
//     // Vite transforma JSX on-the-fly com esbuild (ultrarrápido)
//
//   Em produção: Rollup (Vite 7) / Rolldown (Vite 8)
//     // Gera bundle otimizado, minificado, com tree-shaking

// ─────────────────────────────────────────────────────────────
// Setup em 30 segundos (seção 4.2)
// ─────────────────────────────────────────────────────────────

//   npm create vite@latest my-app
//   cd my-app && npm install && npm run dev
//   → Server rodando em http://localhost:5173 — zero configuração

// ─────────────────────────────────────────────────────────────
// Importando assets (seção 4.2)
// ─────────────────────────────────────────────────────────────

// CSS — injetado automaticamente no <head>:
//   import './styles.css';

// CSS Modules:
//   import styles from './Button.module.css';
//   function Button() {
//     return <button className={styles.primary}>Click</button>;
//   }

// Imagens:
//   import logo from './logo.png';
//   function Header() { return <img src={logo} alt="Logo" />; }

// Import como URL (sem processar inline):
//   import imageUrl from './image.png?url';

// Import como string (SVG como texto):
//   import svgContent from './icon.svg?raw';

// ─────────────────────────────────────────────────────────────
// Variáveis de ambiente (seção 4.5)
// ─────────────────────────────────────────────────────────────

// # .env
// VITE_API_URL=https://api.example.com   ← EXPOSTO ao client
// VITE_PUBLIC_KEY=prod_key_123           ← EXPOSTO ao client
// DATABASE_URL=postgres://...            ← NÃO exposto (sem prefixo VITE_)
// SECRET_KEY=very_secret                 ← NÃO exposto

// Acesso no código:
//   console.log(import.meta.env.VITE_API_URL);
// ⚠️ Segurança: apenas variáveis com prefixo VITE_ são expostas ao client.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 4.5 — Code splitting por rota (lazy loading)
// ─────────────────────────────────────────────────────────────

// router.js — cada rota vira um chunk separado
// const Home      = lazy(() => import('./pages/Home'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Admin     = lazy(() => import('./pages/Admin'));

// Build output com code splitting:
//   dist/
//   ├── index.html
//   └── assets/
//       ├── index.a3f2b1c4.js    ← Entry point (pequeno)
//       ├── vendor.d4e5f6a7.js   ← React, React-DOM (cacheado por muito tempo)
//       ├── home-b8c9d0e1.js     ← Página Home
//       ├── dashboard-e2f3a4b5.js
//       └── admin-c6d7e8f9.js   ← Só baixa para admins

// Vendor splitting (manualChunks na vite.config.js):
// manualChunks: {
//   vendor: ['react', 'react-dom', 'react-router-dom'],
//   charts: ['recharts', 'd3'],
//   utils:  ['lodash-es', 'date-fns']
// }
// 💡 Vendor splitting melhora o cache: quando você atualiza seu código,
//    o chunk de vendors não muda — o usuário não precisa baixar o React de novo.

// ─────────────────────────────────────────────────────────────
// Dynamic imports — básico (seção 4.1)
// ─────────────────────────────────────────────────────────────

// button.addEventListener('click', async () => {
//   const admin = await import('./admin.js');
//   // admin.js só é baixado quando o usuário clicar
// });

// ─────────────────────────────────────────────────────────────
// Glob imports — padrão Vite (Caso Real — seção migração)
// ─────────────────────────────────────────────────────────────

// // Import dinâmico com variável — requer glob em Vite:
// const modules   = import.meta.glob('./components/*.jsx');
// const Component = await modules[`./components/${name}.jsx`]();

// // Assets com glob:
// const images = import.meta.glob('./images/*.png', { eager: true });

// ─────────────────────────────────────────────────────────────
// HMR — Hot Module Replacement (seção 4.2)
// ─────────────────────────────────────────────────────────────

// Webpack: 2–5 segundos para HMR em projetos médios
// Vite: < 50ms consistentemente
//
// O que é preservado durante HMR:
//   • Estado do componente (useState, etc.)
//   • Scroll position
//   • Form inputs

// ─────────────────────────────────────────────────────────────
// Source maps (seção 4.7) — preview executável
// ─────────────────────────────────────────────────────────────

// Sem source map — você vê no console:
//   Error: Discount cannot exceed 100%
//   at c (bundle.a3f2b1c4.js:1:234)    ← Inútil para debugging

// Com source map — você vê:
//   Error: Discount cannot exceed 100%
//   at calculateDiscount (src/utils.js:3:11)  ← Exato!

function calculateDiscount(price, discount) {
  if (discount > 100) {
    throw new Error('Discount cannot exceed 100%');
  }
  return price * (1 - discount / 100);
}

// ─────────────────────────────────────────────────────────────
// Build output (seção 4.2)
// ─────────────────────────────────────────────────────────────

//   npm run build    → usa Rollup/Rolldown para bundle otimizado
//   npm run preview  → testa o build localmente antes do deploy
//   💡 Sempre execute npm run preview antes de fazer deploy.

// ─────────────────────────────────────────────────────────────
// Cheat sheet Vite (seção final do capítulo)
// ─────────────────────────────────────────────────────────────

const viteCheatSheet = {
  criar:   'npm create vite@latest my-app',
  dev:     'npm run dev',
  build:   'npm run build',
  preview: 'npm run preview',
  envVar:  'import.meta.env.VITE_NOME_DA_VAR',
  assets: {
    css:      "import './styles.css'",
    modules:  "import styles from './App.module.css'",
    imagem:   "import logo from './logo.png'",
    glob:     "import.meta.glob('./components/*.jsx')",
    dynamic:  "await import('./Component.jsx')",
  }
};

// ─────────────────────────────────────────────────────────────
// Demo executável
// ─────────────────────────────────────────────────────────────
console.log('=== Vite cheat sheet ===');
for (const [key, val] of Object.entries(viteCheatSheet)) {
  if (typeof val === 'string') {
    console.log(`${key.padEnd(10)}: ${val}`);
  } else {
    console.log(`\n${key}:`);
    for (const [k, v] of Object.entries(val)) {
      console.log(`  ${k.padEnd(10)}: ${v}`);
    }
  }
}

console.log('\n=== calculateDiscount ===');
console.log('R$100 com 20% off:', calculateDiscount(100, 20)); // 80
try {
  calculateDiscount(100, 150); // lança erro
} catch (e) {
  console.log('Erro capturado:', e.message);
}

// ─────────────────────────────────────────────────────────────
// Segurança com source maps (seção 4.7 — lembrete)
// ─────────────────────────────────────────────────────────────
// sourcemap: 'hidden' → gera .map mas não referencia no bundle
// Use com Sentry em produção.
// Nunca exponha source maps publicamente — contêm código-fonte antes da minificação.
