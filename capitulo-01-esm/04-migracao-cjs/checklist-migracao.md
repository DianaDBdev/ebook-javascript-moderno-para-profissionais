# Checklist de Migração ESM
> Capítulo 1 — Seção 1.5 e Caso Real (Seção 1.6)

Use este checklist ao migrar um projeto de CommonJS para ESM.

---

## Preparação

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Todas as dependências atualizadas (`npm outdated`)
- [ ] Suite de testes cobrindo funcionalidades críticas
- [ ] Branch dedicado criado: `git checkout -b migrate-to-esm`

---

## Configuração

- [ ] Adicionar `"type": "module"` no `package.json`

---

## Migração de código (por módulo, em ordem)

```
utils/       ← Comece aqui (sem dependências internas)
services/    ← Depois aqui
routes/      ← Por último
app.js       ← Final
```

Para cada módulo:

- [ ] `require()` → `import`
- [ ] `module.exports` → `export`
- [ ] Adicionar `.js` em todos os imports locais
- [ ] Substituir `__dirname` / `__filename` com `getModulePath(import.meta.url)`
- [ ] Atualizar imports de JSON (`with { type: 'json' }` no Node 20.10+)
- [ ] `require()` condicional → `await import()` com top-level await

---

## Testes e deploy

- [ ] Todos os testes passando (`npm test`)
- [ ] Testes manuais em ambiente de desenvolvimento
- [ ] Deploy em staging
- [ ] Smoke tests em produção
- [ ] Deploy gradual (canary)
- [ ] Monitoramento por 24h pós-deploy

---

## Problemas comuns e soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| `__dirname is not defined` | Não existe em ESM | Use `getModulePath(import.meta.url)` — ver `path-helper.js` |
| Import sem extensão quebra | ESM exige `.js` explícito | Adicione `.js` em todos os imports locais |
| `require()` de módulo ESM falha | CJS não pode importar ESM diretamente | Use `await import()` dentro de `async` |
| Jest não funciona com ESM | Suporte limitado | Migre para Vitest: `npm install -D vitest` |
| JSON import dá erro | Sintaxe mudou | `import pkg from './pkg.json' with { type: 'json' }` (Node 20.10+) |

---

## Recursos

- MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- Node.js docs: https://nodejs.org/api/esm.html
- Nota 2026: a grande maioria das bibliotecas npm já publica apenas ESM — pacotes duais CJS/ESM estão sendo abandonados.
