// tree-shaking.js — Seções 4.1 e 4.6: Por que bundlers existem + Tree-shaking
// Capítulo 4 — Build Tools: Além do Webpack
//
// Execute: node exemplos/tree-shaking.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 4.1 — Por que bundlers são necessários
// ─────────────────────────────────────────────────────────────

// O PROBLEMA: módulos no navegador sem bundler
//
//   // main.js
//   import { add }    from './math.js';
//   import { format } from './format.js';
//   import { api }    from './api.js';
//   console.log(format(add(1, 2)));
//
//   <!-- index.html -->
//   <script type="module" src="main.js"></script>
//
// O que acontece:
//   • Navegador baixa main.js — 1 requisição HTTP
//   • Vê 3 imports, faz 3 novas requisições
//   • Cada arquivo pode ter seus próprios imports
//   • Pode virar 50+ requisições HTTP para carregar o app
//   ⚠️ Resultado: app lento, latência multiplicada.

// A SOLUÇÃO: bundling
//   // bundle.js — bundler transforma tudo em um arquivo
//   const add    = (a, b) => a + b;
//   const format = (n)    => `Result: ${n}`;
//   console.log(format(add(1, 2)));
//   💡 1 arquivo, 1 requisição HTTP, carregamento rápido.

// O QUE MAIS BUNDLERS FAZEM:
//
// 1. Transpilação — código moderno para browsers antigos:
//   // Você escreve (ES2024)
//   const user = data?.user ?? 'Guest';
//   // Bundler gera (ES5 — simplificado para fins ilustrativos)
//   var user = data && data.user !== null && data.user !== undefined ? data.user : 'Guest';
//
// 2. Tree-shaking — eliminar código morto:
//   import { debounce } from 'lodash'; // lodash tem 500 funções
//   // Bundle final: APENAS debounce (~2 KB)
//
// 3. Code splitting — carregar sob demanda:
//   button.addEventListener('click', async () => {
//     const admin = await import('./admin.js'); // baixa só quando clicar
//   });
//
// 4. Otimização de assets:
//   import logo from './logo.png';
//   // Bundler: otimiza, gera webp, adiciona hash (cache busting)
//
// 5. Hot Module Replacement (HMR):
//   // Você muda o código → apenas aquele módulo atualiza
//   // Sem refresh — estado do app preservado

// Por que não usar módulos nativos diretamente?
//   • Sem tree-shaking — browser baixa código que nunca usa
//   • Sem transpilação — não funciona em browsers mais antigos
//   • Sem minificação — bundle maior
//   💡 Bundlers ainda são necessários para produção — mesmo em 2026.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 4.6 — Tree-shaking: como eliminar código morto
// ─────────────────────────────────────────────────────────────

// O que é tree-shaking? A metáfora é perfeita:
// o bundler "sacode a árvore" e deixa cair apenas o que não está sendo usado.

// Exemplo: math.js com 4 funções
export function add(a, b)      { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b)   { return a / b; }

// main.js — só usa add:
//   import { add } from './math.js';
//   console.log(add(1, 2));
//   ❌ Sem tree-shaking: bundle inclui as 4 funções
//   ✅ Com tree-shaking: bundle inclui SÓ add

// COMO FUNCIONA INTERNAMENTE:
//   1. Análise estática — lê os imports:
//      import { add } from 'module'; // Usado
//      // subtract, multiply, divide → nunca importados
//   2. Marcação: add → KEEP, demais → REMOVE
//   3. Eliminação — bundle contém apenas o necessário

// ESM É ESSENCIAL PARA TREE-SHAKING:
//   // ❌ CommonJS: não funciona
//   const { add } = require('./math'); // require() é dinâmico
//
//   // ✅ ESM: funciona
//   import { add } from './math.js';  // import é estático

// ─────────────────────────────────────────────────────────────
// Side effects e tree-shaking
// ─────────────────────────────────────────────────────────────

// ❌ Com side effect — bundler NÃO pode remover
// export function add(a, b) { return a + b; }
// console.log('math.js loaded'); // Side effect!
// Mesmo que add não seja usado, o arquivo é mantido.

// ✅ Declare no package.json para habilitar tree-shaking total:
//   { "sideEffects": false }
//   // Ou especifique só os arquivos com side effects:
//   { "sideEffects": [".css", ".scss", "src/polyfills.js"] }

// ─────────────────────────────────────────────────────────────
// Exemplo real: lodash
// ─────────────────────────────────────────────────────────────

// ❌ Importa TUDO (70 KB+)
// import _ from 'lodash';
// _.debounce(fn, 300);

// ⚠️ Melhor, mas pode não tree-shakar com CJS lodash
// import { debounce } from 'lodash';

// ✅ Import direto — tree-shake garantido
// import debounce from 'lodash/debounce';

// ✅ Ou use lodash-es (versão ESM — preferível)
// import { debounce } from 'lodash-es';

// ─────────────────────────────────────────────────────────────
// Verificando tree-shaking com rollup-plugin-visualizer
// ─────────────────────────────────────────────────────────────

// npm install -D rollup-plugin-visualizer
//
// import { visualizer } from 'rollup-plugin-visualizer';
// export default defineConfig({
//   plugins: [ visualizer({ open: true, gzipSize: true }) ]
// });
// → Gera stats.html mostrando tamanho de cada módulo

// ─────────────────────────────────────────────────────────────
// Por que tree-shaking pode não funcionar — debugging
// ─────────────────────────────────────────────────────────────

// 1. Código com side effects:
function addWithSideEffect(a, b) {
  // counter++; // Modifica estado global → bundler não pode remover
  return a + b;
}

// 2. Default export — dificulta análise:
// ❌ Bundler inclui tudo
// export default { add, subtract, multiply, divide };
// import math from './math'; math.add(1, 2);

// ✅ Named exports — bundler remove o que não usa
// export { add, subtract, multiply, divide };
// import { add } from './math'; // só add é incluído

// 3. CommonJS misturado — quebra a cadeia:
// import { thing } from './esm-module';
// // Se esm-module internamente usa require() → tree-shaking não funciona

// ─────────────────────────────────────────────────────────────
// Comparação: Webpack vs Vite vs esbuild (seção 4.4)
// ─────────────────────────────────────────────────────────────

const comparison = {
  webpack: {
    devStart:  '5–60s',  hmr: '1–10s',  build: '10–300s', config: '50–500 linhas',
    bestFor:   'Projetos legados que dependem de loaders específicos'
  },
  vite: {
    devStart:  '<1–5s',  hmr: '<50–200ms', build: '5–240s', config: '0–40 linhas',
    bestFor:   'Projetos novos, React/Vue/Svelte, DX máxima'
  },
  esbuild: {
    devStart:  'N/A',    hmr: 'N/A',    build: '0.5–10s',  config: '20–30 linhas',
    bestFor:   'Bibliotecas, CLIs, transpilação TypeScript ultrarrápida'
  }
};

console.log('Comparação de bundlers:');
for (const [tool, data] of Object.entries(comparison)) {
  console.log(`\n${tool.toUpperCase()}:`);
  console.log(`  Build:   ${data.build} | HMR: ${data.hmr}`);
  console.log(`  Config:  ${data.config}`);
  console.log(`  Melhor para: ${data.bestFor}`);
}

// Demo: tree-shaking de math.js
console.log('\nDemo tree-shaking (math functions):');
console.log('add(3, 4)     :', add(3, 4));
console.log('multiply(3, 4):', multiply(3, 4));
console.log('Num. funções exportadas: 4 | Num. usadas neste arquivo: 2');
console.log('→ bundler removeria subtract e divide do bundle final');
