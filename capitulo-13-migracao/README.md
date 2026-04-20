# Capítulo 13 — Migrando Projetos Legados

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Avaliar o que migrar com um framework de pontuação — não com emoção
- Strangler Fig Pattern: substituir o legado sem parar o mundo
- Feature flags para rollout gradual e rollback instantâneo sem deploy
- Adapter e Facade: código novo e legado coexistindo com segurança
- Characterization tests: a rede de segurança antes de qualquer refatoração
- ADRs e guias internos: a dimensão humana da migração
- Caso Real: 18 meses, 60k linhas, 11% → 78% de coverage, 92% menos bugs

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/strangler-fig.js`](exemplos/strangler-fig.js) | 13.2 | Strangler Fig fases, feature flags com `isInBucket` hash determinístico, canary releases nginx, ordem segura de migração |
| [`exemplos/coexistencia-cjs-esm.js`](exemplos/coexistencia-cjs-esm.js) | 13.3 | Adapter (callback → Promise), Facade (3 módulos legados → 1 interface), dual-write, eventos de sincronização |
| [`exemplos/refatoracao-segura.js`](exemplos/refatoracao-segura.js) | 13.1 + 13.4 | Framework de avaliação, mito da reescrita, characterization tests (`applyDiscounts` 72≠70), Boy Scout Rule, ADR, métricas de progresso |
| [`exemplos/comunicacao-migracao.js`](exemplos/comunicacao-migracao.js) | 13.5 + Caso Real | Guia interno, ESLint bloqueando `require()`, Caso Real 18 meses (roadmap, 2.847 erros de strict, resistência de devs, resultados) |

---

## Como executar

```bash
cd capitulo-13-migracao
node exemplos/strangler-fig.js
node exemplos/coexistencia-cjs-esm.js
node exemplos/refatoracao-segura.js
node exemplos/comunicacao-migracao.js
```

---

## Mapa por seção

### 13.1 — O que migrar (e o que não)

```js
// Framework de pontuação (1–5 cada critério, max 30):
// • Dívida técnica ativa     • Custo de onboarding
// • Velocidade de entrega    • Cobertura de testes
// • Tamanho dos arquivos     • Disponibilidade do time
//
// 26–30: migração crítica | 20–25: urgente | 12–19: planejada | <12: opcional

// O que NÃO migrar:
// ✗ Funciona perfeitamente e raramente muda ("não mexa no que funciona")
// ✗ Prestes a ser descomissionado
// ✗ Tão crítico que qualquer mudança exige meses de QA

// Joel Spolsky: "a coisa mais errada que uma empresa de software pode fazer"
// → Grande reescrita. Prefira migração incremental de 6 meses.
```

### 13.2 — Strangler Fig Pattern

```
Fase 1: Legado 100% | Novo   0%  ← em desenvolvimento
Fase 2: Legado  70% | Novo  30%  ← /api/v2, novas features
Fase 3: Legado  10% | Novo  90%  ← só endpoints não migrados
Fase 4: Legado   0% | Novo 100%  ← legado desligado
```

```js
// Feature flag — rollback instantâneo sem deploy
const flags = await getFeatureFlags(user.id);
if (flags.useNewUserService) {
  return await newUserService.create(input);  // Novo (10% dos usuários)
} else {
  return await legacyUserService.create(input); // Legado
}

// Hash determinístico — mesmo usuário sempre no mesmo bucket
const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
// Para produção: use crypto.createHash('sha256') para distribuição uniforme
```

### 13.3 — Coexistência

```ts
// Adapter: expõe Promise sem tocar no legado callback
const createUserAsync = promisify(legacyUserService.createUser);
// assume callback(err, result) — se o legado usa outra convenção, use new Promise manual
const user = await createUserAsync(input.name, input.email);

// Dual-write: escreve em dois schemas simultaneamente
await db.legacyOrders.insert({ user_id: ..., total: ... }); // antigo
await db.orders.insert({ userId: ..., amount: ..., status: 'pending' }); // novo
// ⚠️ Risco de inconsistência — use transações ou reconciliação periódica

// Banco: migrações backward-compatible
// ✅ ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
// ❌ DROP COLUMN → só remova DEPOIS que o legado não usa mais
```

### 13.4 — Refatoração segura

```js
// Characterization tests — documentam O QUE É, não o que deveria ser
it('aplica desconto composto (comportamento atual)', () => {
  // (1 - 0.1) × (1 - 0.2) = 0.9 × 0.8 = 0.72 × 100 = 72
  expect(applyDiscounts(100, [0.1, 0.2])).toBe(72); // não 70!
  // 200 clientes configuraram regras em cima desse comportamento
  // Sem esse teste, "corregiríamos" e quebraríamos tudo
});

// Boy Scout Rule: deixe o código um pouco melhor do que encontrou
// Commite a mudança necessária e a melhoria SEPARADAMENTE
```

### 13.5 — Comunicação

```js
// ESLint bloqueando require() em novos arquivos
{
  files: ['src/**/*.ts'],
  rules: {
    'no-restricted-syntax': ['error', {
      selector: 'CallExpression[callee.name="require"]',
      message:  'Use ESM imports. Veja docs/guides/using-esm.md',
    }],
  }
},
{ files: ['src/legacy/**'], rules: { '@typescript-eslint/no-var-requires': 'off' } }
```

---

## Caso Real — API Express, 60k linhas, 18 meses

| Métrica | Antes | Depois |
|---------|-------|--------|
| Coverage de testes | 11% | 78% |
| Bugs produção/semana | 5 | 0,4 (-92%) |
| Tempo de onboarding | 2 semanas | 3 dias |
| Feature média | 2 semanas | 4 dias |
| Bundle size | baseline | -35% |
| Satisfação do time | 5,1/10 | 8,6/10 |

**Surpresa:** Ativar `strict: true` no T5 revelou 2.847 erros. Levou 6 semanas extras.
**Lição:** Active `strict: true` no **início** — distribui o custo de forma gerenciável.

**Resistência de 2 devs seniores:** Resolvida com conversa honesta sobre o impacto no **trabalho deles** — bugs que resolviam toda semana, dificuldade para onboarding de juniores que mentoravam.

---

## Recursos

- [Martin Fowler — Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [ADR GitHub](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Working Effectively with Legacy Code — Michael Feathers](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
- [jscpd — detecção de código duplicado](https://github.com/kucherenko/jscpd)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
