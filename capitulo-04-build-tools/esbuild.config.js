// esbuild.config.js — Seção 4.3: esbuild — performance extrema
// Capítulo 4 — Build Tools: Além do Webpack
//
// Execute: node exemplos/esbuild.config.js
// (Requer: npm install -D esbuild)

// import * as esbuild from 'esbuild'; // npm install -D esbuild

// ─────────────────────────────────────────────────────────────
// Por que esbuild é tão rápido?
// ─────────────────────────────────────────────────────────────
//
// • Escrito em Go — compilado, não interpretado
//   (o binário executa diretamente no SO, sem o overhead da VM do Node.js)
// • Paralelização — usa todos os cores da CPU
// • Zero overhead — sem camadas de abstração
// • Otimizações agressivas desde o design
//
// Webpack:   20–30 segundos para build médio
// esbuild:   0,3–0,5 segundos para o mesmo build  →  100× mais rápido

// ─────────────────────────────────────────────────────────────
// 1. CLIs e ferramentas Node.js (seção 4.3)
// ─────────────────────────────────────────────────────────────

// await esbuild.build({
//   entryPoints: ['src/cli.ts'],
//   bundle:      true,
//   platform:    'node',
//   target:      'node18',
//   outfile:     'dist/cli.js'
// });

// ─────────────────────────────────────────────────────────────
// 2. Bibliotecas (não apps)
// ─────────────────────────────────────────────────────────────

// await esbuild.build({
//   entryPoints: ['src/index.ts'],
//   bundle:      true,
//   format:      'esm',
//   outfile:     'dist/index.js',
//   external:    ['react', 'react-dom'] // Não bundla peer deps
// });

// ─────────────────────────────────────────────────────────────
// 3. Transpilação rápida de TypeScript
// ─────────────────────────────────────────────────────────────

// import { transform } from 'esbuild';
// const result = await transform(code, {
//   loader: 'tsx',
//   target: 'es2020'
// });
// 💡 10–100× mais rápido que tsc para transpilação pura.

// ─────────────────────────────────────────────────────────────
// Configuração básica completa
// ─────────────────────────────────────────────────────────────

// await esbuild.build({
//   entryPoints: ['src/index.js'],
//   bundle:      true,
//   minify:      true,
//   sourcemap:   true,
//   target:      ['chrome90', 'firefox88', 'safari14'],
//   outfile:     'dist/bundle.js'
// });

// ─────────────────────────────────────────────────────────────
// Limitações do esbuild
// ─────────────────────────────────────────────────────────────

// 1. Tree-shaking menos agressivo que Rollup:
//   import { unused } from 'library';
//   // esbuild pode incluir mais código do que Rollup/Webpack

// 2. Sem code splitting avançado:
//   // Code splitting simples existe,
//   // mas sem as otimizações avançadas do Rollup

// 3. Sem HMR nativo:
//   // esbuild é bundler, não dev server
//   // Precisa de ferramenta adicional para HMR

// ⚠️ Por isso Vite usa a melhor combinação:
//    esbuild em dev (velocidade máxima) + Rolldown em prod (otimização máxima)

// ─────────────────────────────────────────────────────────────
// Quando usar esbuild diretamente vs Vite
// ─────────────────────────────────────────────────────────────

const decisao = {
  'Use esbuild quando': [
    'Está construindo uma biblioteca ou CLI',
    'Velocidade de build é prioridade absoluta',
    'Não precisa de HMR nem dev server',
    'Precisa de transpilação TypeScript ultrarrápida',
  ],
  'Use Vite quando': [
    'Projeto novo (app, não biblioteca)',
    'Quer dev server rápido e HMR instantâneo',
    'Usa framework moderno (React, Vue, Svelte)',
    'Não tem configuração Webpack muito específica',
  ],
  'Use Webpack quando': [
    'Projeto legado grande onde migração seria cara',
    'Precisa de loaders muito específicos sem equivalente no Vite',
    'Time já domina Webpack e não há ganho claro',
  ],
};

console.log('=== Quando usar cada bundler ===\n');
for (const [cenario, razoes] of Object.entries(decisao)) {
  console.log(cenario + ':');
  razoes.forEach(r => console.log(`  • ${r}`));
  console.log();
}

// ─────────────────────────────────────────────────────────────
// Demo: transpilação com esbuild (se instalado)
// ─────────────────────────────────────────────────────────────
try {
  const { transform } = await import('esbuild');
  const tsCode = `
    const greet = (name: string): string => \`Hello, \${name}!\`;
    export default greet;
  `;
  const result = await transform(tsCode, {
    loader: 'ts',
    target: 'es2020',
  });
  console.log('=== esbuild transform (TypeScript → JS) ===');
  console.log(result.code.trim());
} catch (e) {
  console.log('esbuild não instalado — install: npm install -D esbuild');
  console.log('Exemplo de output:');
  console.log('  const greet = (name) => `Hello, ${name}!`;');
  console.log('  export default greet;');
}
