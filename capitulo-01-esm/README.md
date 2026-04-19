# Capítulo 1 — ESM (ECMAScript Modules): O Novo Padrão

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Por que ESM é superior ao CommonJS (análise estática, tree-shaking, padrão universal)
- Sintaxe completa: `import`/`export`, named vs default, alias, namespace
- Dynamic imports e code splitting sob demanda
- Migração passo a passo de `require()` para `import`
- Como recriar `__dirname` e `__filename` em ESM
- JSON imports com a sintaxe moderna do Node.js 20.10+

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/named-exports.js`](exemplos/named-exports.js) | 1.2 e 1.3 | Named exports, alias (`as`), namespace (`* as`), validators, constantes |
| [`exemplos/default-export.js`](exemplos/default-export.js) | 1.3 | Default export, quando usar, o problema dos nomes inconsistentes |
| [`exemplos/dynamic-import.js`](exemplos/dynamic-import.js) | 1.4 | Dynamic `import()`, carregamento condicional, React.lazy, preload estratégico |
| [`exemplos/migracao-cjs-para-esm.js`](exemplos/migracao-cjs-para-esm.js) | 1.5 | Conversão CJS→ESM passo a passo, interoperabilidade, ordem de migração |
| [`exemplos/path-helper.js`](exemplos/path-helper.js) | 1.5 + Caso Real | `getModulePath()`, JSON import, substituição de `__dirname` |
| [`exemplos/checklist-migracao.md`](exemplos/checklist-migracao.md) | 1.5 + 1.6 | Checklist completo de migração com problemas comuns e soluções |

---

## Pré-requisitos

- Node.js 18+ (`node --version`)
- Nenhuma dependência npm necessária para este capítulo

---

## Como executar

```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais.git
cd ebook-javascript-moderno-para-profissionais/capitulo-01-esm

# Named exports — seção 1.2
node exemplos/named-exports.js

# Default export — seção 1.3
node exemplos/default-export.js

# Path helper (getModulePath) — seção 1.5 / Caso Real
node exemplos/path-helper.js

# Migração (referência comentada — não executável diretamente)
# Abra: exemplos/migracao-cjs-para-esm.js
```

> **Nota:** `dynamic-import.js` usa top-level `await` — requer `"type": "module"` no `package.json` pai ou Node.js 20+.

---

## Mapa de exemplos por seção

### 1.1 — O problema com CommonJS e require()
Os problemas estão documentados como comentários em `migracao-cjs-para-esm.js`:
- Carregamento síncrono que bloqueia o navegador
- Sem tree-shaking nativo (toda a lodash por um `debounce`)
- Análise estática impossível para IDEs e bundlers
- Exports dinâmicos/condicionais

### 1.2 — import/export: sintaxe e casos de uso
→ `named-exports.js`
```js
export function formatCurrency(value) { ... }   // named export
export const API_URL = 'https://api.example.com';

import { formatCurrency as formatMoney } from './utils.js'; // alias
import * as utils from './utils.js';                        // namespace
```

### 1.3 — Named exports vs Default exports
→ `named-exports.js` + `default-export.js`
```js
// Default export (User.js)
export default class User { ... }
import User from './User.js'; // sem chaves

// Problema: cada dev usa um nome diferente
import UserService from './UserService.js'; // Arquivo 1
import UserManager from './UserService.js'; // Arquivo 2 — inconsistente!
```

### 1.4 — Dynamic imports e code splitting
→ `dynamic-import.js`
```js
// Carrega só quando o usuário clica — não na inicialização
button.addEventListener('click', async () => {
  const adminPanel = await import('./admin-panel.js');
  adminPanel.init();
});

// Preload estratégico: inicia no mouseenter, já está no cache no click
button.addEventListener('mouseenter', () => { import('./admin-panel.js'); });
```

### 1.5 — Migração prática: de require() para import
→ `migracao-cjs-para-esm.js` + `path-helper.js`
```js
// Passo 1: adicione ao package.json
{ "type": "module" }

// Passo 3: __dirname não existe em ESM — use o utilitário:
import { getModulePath } from './utils/path-helper.js';
const { dirname: __dirname } = getModulePath(import.meta.url);
```

### 1.6 — Compatibilidade, transpilação e Caso Real
→ `checklist-migracao.md` + comentários em `path-helper.js`

**Nota 2026:** 2026 é considerado o ano da adoção plena de ESM. A grande maioria das bibliotecas npm já publica apenas ESM. Se você ainda mantém pacotes duais CJS/ESM, considere migrar para ESM-only.

---

## Exercícios (do livro)

### Exercício 1: Conversão básica
Converta o código abaixo de CommonJS para ESM:
```js
const fs   = require('fs');
const path = require('path');
function readConfig() {
  const configPath = path.join(__dirname, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
module.exports = { readConfig };
```
*Dica: use `getModulePath` do `path-helper.js` para tratar o `__dirname`.*

### Exercício 2: Code splitting
Crie uma aplicação simples onde a home page carrega imediatamente, mas o painel admin só é carregado ao clicar no botão. Use `dynamic import()`.

### Exercício 3: Migração real
Pegue um projeto seu e migre para ESM usando o `checklist-migracao.md`.

---

## Recursos

- [MDN — JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js ESM docs](https://nodejs.org/api/esm.html)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
