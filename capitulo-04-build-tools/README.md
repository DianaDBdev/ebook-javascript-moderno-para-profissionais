# Capítulo 4 — Build Tools: Além do Webpack

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Por que bundlers são necessários em 2026 — e o que eles fazem além de bundlar
- Vite: setup instantâneo, HMR < 50ms, configuração mínima
- esbuild: 100× mais rápido que Webpack para builds e transpilação TypeScript
- Vite 8 + Rolldown: motor único Rust para dev e produção
- Ecossistema Oxc: Oxlint, Oxfmt, tsdown
- Tree-shaking: como funciona, por que falha, como debugar
- Source maps: debugging em produção com Sentry
- Migração real Webpack → Vite: de 45s para 1,2s de dev server

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`vite.config.js`](vite.config.js) | 4.2 + 4.5 + Caso Real | Template de config Vite completo: plugins, aliases, proxy, sourcemaps, manualChunks, compressão |
| [`exemplos/tree-shaking.js`](exemplos/tree-shaking.js) | 4.1 + 4.6 | Por que bundlers existem, math.js tree-shaking, comparação Webpack/Vite/esbuild, sideEffects |
| [`exemplos/code-splitting.js`](exemplos/code-splitting.js) | 4.2 + 4.5 + 4.7 | Como Vite funciona, lazy loading, glob imports, source maps, cheat sheet completo |
| [`exemplos/esbuild.config.js`](exemplos/esbuild.config.js) | 4.3 | Quando usar esbuild, configs para CLI/lib/transpilação TS, limitações, decisão arquitetural |
| [`exemplos/rolldown-vite8.js`](exemplos/rolldown-vite8.js) | 4.3b | Vite 8 vs 7, ecossistema Oxc (Rolldown, Oxlint, Oxfmt, tsdown), tabela de decisão 2026 |
| [`exemplos/migrate-imports.js`](exemplos/migrate-imports.js) | Caso Real | Script real de migração Webpack→Vite: adiciona extensões, migra env vars, todos os 10 passos |

---

## Pré-requisitos

- Node.js 18+
- Nenhuma dependência npm para os exemplos executáveis

---

## Como executar

```bash
cd capitulo-04-build-tools

# Por que bundlers existem + tree-shaking
node exemplos/tree-shaking.js

# Como Vite funciona + code splitting + source maps
node exemplos/code-splitting.js

# esbuild: quando usar e quando não usar
node exemplos/esbuild.config.js

# Vite 8 + Rolldown + ecossistema Oxc
node exemplos/rolldown-vite8.js

# Script de migração Webpack → Vite (dry-run)
node exemplos/migrate-imports.js

# Aplicar a migração em um projeto real:
node exemplos/migrate-imports.js --apply
```

---

## Mapa de exemplos por seção

### 4.1 — Por que bundlers são necessários
```js
// PROBLEMA: sem bundler, 50+ requisições HTTP
import { add }    from './math.js';   // → 1 req
import { format } from './format.js'; // → 1 req
import { api }    from './api.js';    // → 1 req (e cada um traz mais...)

// SOLUÇÃO: 1 arquivo, 1 requisição
// bundle.js: const add = (a,b) => a+b; ...

// Bundlers também fazem:
//   • Transpilação: ES2024 → ES5 para browsers antigos
//   • Tree-shaking: remove código morto
//   • Code splitting: carrega sob demanda
//   • HMR: atualiza sem refresh
```

### 4.2 — Vite: velocidade e simplicidade
```bash
npm create vite@latest my-app  # setup em 30 segundos
cd my-app && npm install && npm run dev
# → Server em http://localhost:5173 — zero configuração
```

### 4.3 — esbuild: performance extrema
```js
// 100× mais rápido que Webpack — escrito em Go
await esbuild.build({
  entryPoints: ['src/cli.ts'],
  bundle: true, platform: 'node', target: 'node18', outfile: 'dist/cli.js'
});
```

### 4.3b — Vite 8 + Rolldown
```
Vite 7: dev=esbuild(Go) + prod=Rollup(JS) → comportamentos diferentes!
Vite 8: dev=Rolldown(Rust) + prod=Rolldown(Rust) → motor único, zero surpresas
         10–30× mais rápido nos builds
```

### 4.5 — Config para produção (vite.config.js)
```js
build: {
  target: 'es2015', minify: 'terser',
  rollupOptions: { output: {
    manualChunks: { vendor: ['react', 'react-dom'], utils: ['lodash-es'] }
  }},
  assetsInlineLimit: 4096, // < 4KB → base64 inline
}
```

### 4.6 — Tree-shaking
```js
// math.js — 4 funções
export function add(a, b)      { return a + b; }   // ← única usada
export function subtract(a, b) { return a - b; }   // ← removida pelo bundler
export function multiply(a, b) { return a * b; }   // ← removida
export function divide(a, b)   { return a / b; }   // ← removida

// ✅ lodash-es (ESM) → tree-shaking garantido
import { debounce } from 'lodash-es';
// ❌ lodash (CJS) → bundle pode incluir tudo
```

### 4.7 — Source maps
```js
// Sem source map:   at c (bundle.a3f2b1c4.js:1:234) ← inútil
// Com source map:   at calculateDiscount (src/utils.js:3:11) ← exato!

// sourcemap: 'hidden' → gera .map mas não expõe publicamente
// Use com Sentry — nunca exponha source maps em produção!
```

---

## Caso Real — Migração Webpack → Vite

**Projeto:** admin dashboard React, 3 anos, Webpack config de 400 linhas

| Métrica | Antes (Webpack) | Depois (Vite) | Ganho |
|---------|-----------------|---------------|-------|
| Dev server | 45s | 1,2s | -97% |
| HMR | 3–5s | <100ms | -98% |
| Build | 4min | 1,5min | -62% |
| Config | 400 linhas | 35 linhas | -91% |
| devDependencies | 45 pacotes | 12 pacotes | -73% |
| Onboarding | 1 dia | 30 minutos | -94% |

**Os 10 passos da migração** estão documentados em [`exemplos/migrate-imports.js`](exemplos/migrate-imports.js).

---

## Decisão arquitetural

| Cenário | Ferramenta |
|---------|------------|
| Projeto novo (app) | **Vite 8** — zero config, HMR instantâneo |
| Biblioteca / CLI | **esbuild** — velocidade máxima, sem dev server |
| Linting ultrarrápido | **Oxlint** (projetos novos) / ESLint flat config (existentes) |
| Publicar lib TypeScript | **tsdown** (baseado em Rolldown) |
| Projeto legado grande | **Webpack** — custo de migração pode não valer |

---

## Recursos

- [Vite docs](https://vitejs.dev)
- [esbuild docs](https://esbuild.github.io)
- [Rolldown](https://rolldown.rs)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- [Benchmarks esbuild](https://github.com/evanw/esbuild#benchmark)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
