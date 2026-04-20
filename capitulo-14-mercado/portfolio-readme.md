# Nome do Projeto

Breve descrição de 1–2 linhas do que resolve e para quem.

[![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/user/repo/actions)
[![Coverage](https://codecov.io/gh/user/repo/badge.svg)](https://codecov.io/gh/user/repo)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

---

## O Problema

Descrição do problema real. Por que isso precisa existir?
Qual era a alternativa antes e por que não era suficiente?

---

## Decisões Técnicas

### Por que Next.js App Router em vez de Vite + React Router?

SSR era necessário para SEO — o produto é um blog técnico com 10k artigos.
App Router permite Server Components, reduzindo o bundle em ~40%.

### Por que Vitest em vez de Jest?

Integração nativa com Vite elimina configuração de transpilação.
3× mais rápido no watch mode — feedback imediato durante desenvolvimento.

### Por que Zod para validação?

Types derivados automaticamente do schema — single source of truth.
Validação em runtime com a mesma definição dos tipos estáticos.

---

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind
- **Backend**: Node.js, tRPC, Prisma + PostgreSQL
- **Infra**: Vercel (frontend), Fly.io (API), Supabase (DB)
- **Qualidade**: Vitest, Playwright, ESLint flat config, Prettier
- **CI/CD**: GitHub Actions (quality gate + deploy automático)

---

## Arquitetura

```
src/
├── features/         ← Organizado por domínio (feature-first)
│   ├── auth/
│   ├── users/
│   └── products/
├── shared/           ← Código genuinamente compartilhado
└── app/              ← Configuração global e entry points
```

---

## Rodando localmente

```bash
git clone https://github.com/user/repo
cd repo
cp .env.example .env
docker compose up -d    # Sobe PostgreSQL
npm install
npm run db:migrate
npm run dev             # http://localhost:3000
```

**Variáveis de ambiente necessárias:** veja `.env.example` para todos os campos.

---

## Testes

```bash
npm run test          # Unitários e integração (watch)
npm run test:run      # Uma vez e sai
npm run test:e2e      # E2E com Playwright
npm run test:coverage # Relatório de cobertura
```

Cobertura atual: **87%** (veja badge acima).

---

## O que aprendi

- Migrar para App Router foi mais trabalhoso do que esperava — RSC tem
  um modelo mental diferente de Client Components
- Playwright E2E no CI exigiu configuração extra de webServer para
  subir a aplicação antes dos testes
- tRPC simplificou muito a comunicação frontend/backend, mas o
  debugging inicial foi confuso sem conhecer o protocolo interno

---

## Próximos passos

- [ ] Adicionar suporte a i18n
- [ ] Migrar para Edge Runtime no middleware
- [ ] Explorar React 19 Actions para mutações de formulário

---

<!-- Template de README para portfólio — Capítulo 14 do livro  -->
<!-- "JavaScript Moderno para Profissionais" — Diana Barbosa & Victor Pitts -->
<!--                                                                          -->
<!-- O que este README demonstra ao recrutador:                               -->
<!-- 1. Você tem um problema real para resolver (não é Todo List)            -->
<!-- 2. Você documenta decisões técnicas (por que X e não Y)                 -->
<!-- 3. Você usa stack moderna com propósito                                  -->
<!-- 4. Você escreve testes e tem CI funcionando                              -->
<!-- 5. Você reflete sobre o que aprendeu — sinal de maturidade              -->
