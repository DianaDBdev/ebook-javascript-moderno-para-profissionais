// commitlint.config.js — Seção 6.3: Conventional Commits
// Capítulo 6 — Linting, Formatting e Code Quality
//
// Instalação:
//   npm install -D @commitlint/cli @commitlint/config-conventional
//
// Hook (via Husky):
//   echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg

export default {
  extends: ['@commitlint/config-conventional']
};

// ─────────────────────────────────────────────────────────────
// Formato Conventional Commits
// ─────────────────────────────────────────────────────────────

// Estrutura:
//   <tipo>(<escopo opcional>): <descrição>

// ✅ Exemplos válidos:
//   feat(auth): add JWT refresh token support
//   fix(api): handle null response from user endpoint
//   docs: update README with new env variables
//   chore(deps): update eslint to v9
//   refactor(user): extract validation to separate module
//   test(order): add integration tests for payment flow
//   perf(query): optimize user search with index

// ❌ Exemplos inválidos (commitlint bloqueia):
//   Update stuff
//   fixed bug
//   WIP

// ─────────────────────────────────────────────────────────────
// Tipos de commit e impacto na versão semântica
// ─────────────────────────────────────────────────────────────

// feat     → nova funcionalidade    (minor: 1.0.0 → 1.1.0)
// fix      → correção de bug        (patch: 1.0.0 → 1.0.1)
// docs     → apenas documentação    (sem bump)
// style    → formatação, sem lógica (sem bump)
// refactor → refatoração            (sem bump)
// test     → testes                 (sem bump)
// chore    → manutenção/deps/CI     (sem bump)
// perf     → performance            (patch)
// ci       → mudanças no CI/CD      (sem bump)

// ⚠️ BREAKING CHANGE no corpo (ou feat!:) → major: 1.0.0 → 2.0.0
// Use com cuidado em projetos com consumidores externos.

// ─────────────────────────────────────────────────────────────
// Gerar CHANGELOG automático (Exercício 3 do capítulo)
// ─────────────────────────────────────────────────────────────

// npx conventional-changelog -p angular -i CHANGELOG.md -s
