# Capítulo 6 — Linting, Formatting e Code Quality

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- ESLint v9 com flat config: detecção de bugs antes do runtime
- Prettier: formatação automática e consistente — nunca mais discuta estilo
- ESLint + Prettier juntos sem conflitos via `eslint-config-prettier`
- Husky: Git hooks que protegem o repositório em cada commit
- lint-staged: verificação só dos arquivos alterados — rápido em qualquer repo
- Conventional Commits: histórico legível e changelog automático
- `.editorconfig` e `.vscode/`: onboarding de 3 dias para 4 horas
- CI com GitHub Actions: quality gate que bloqueia merges problemáticos

---

## Estrutura do capítulo

| Arquivo | Seção | O que é |
|---------|-------|---------|
| [`eslint.config.js`](eslint.config.js) | 6.1 | ESLint flat config completo: TypeScript + React + jsx-a11y + prettier |
| [`.prettierrc`](.prettierrc) | 6.2 | Configuração Prettier recomendada |
| [`.prettierignore`](.prettierignore) | 6.2 | Arquivos excluídos da formatação |
| [`package.json`](package.json) | 6.1–6.4 | Scripts `lint`, `format`, `quality`; configuração `lint-staged` |
| [`commitlint.config.js`](commitlint.config.js) | 6.3 | Conventional Commits + guia de tipos e impacto semântico |
| [`.editorconfig`](.editorconfig) | 6.4 | Indentação e charset compartilhados entre todos os editores |
| [`.vscode/settings.json`](.vscode/settings.json) | 6.4 | formatOnSave, fixAll.eslint, organizeImports |
| [`.vscode/extensions.json`](.vscode/extensions.json) | 6.4 | Extensões recomendadas para o time |
| [`.husky/pre-commit`](.husky/pre-commit) | 6.3 | Hook que roda lint-staged antes do commit |
| [`.husky/commit-msg`](.husky/commit-msg) | 6.3 | Hook que valida formato Conventional Commits |
| [`.github/workflows/quality.yml`](.github/workflows/quality.yml) | 6.4 | CI: typecheck → lint → format:check → test |
| [`exemplos/demo-eslint.js`](exemplos/demo-eslint.js) | 6.1–6.4 | Demo executável: ESLint, Prettier, Husky, Conventional Commits, Caso Real |

---

## Como executar o demo

```bash
cd capitulo-06-linting
node exemplos/demo-eslint.js
```

---

## Setup completo em 4 passos

```bash
# 1. Instalar tudo
npm install -D prettier eslint @eslint/js typescript-eslint \
  eslint-plugin-react eslint-plugin-react-hooks \
  eslint-config-prettier husky lint-staged \
  @commitlint/cli @commitlint/config-conventional

# 2. Inicializar Husky
npx husky init

# 3. Formatar tudo (um único commit — facilita git blame)
npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md,json}"
git add -A && git commit -m "chore: apply prettier formatting to entire codebase"

# 4. Verificar que tudo funciona
npm run quality
```

---

## Mapa de exemplos por seção

### 6.1 — ESLint flat config
```js
// eslint.config.js
import js      from '@eslint/js';
import ts      from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      'eqeqeq':                              'error', // sempre ===
      'no-var':                              'error', // sem var
      '@typescript-eslint/no-floating-promises': 'error',
      'react-hooks/rules-of-hooks':          'error',
    }
  },
  prettier // ← SEMPRE o último
);
```

### 6.2 — Prettier
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### 6.3 — Husky + lint-staged + Conventional Commits
```json
// package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}":   ["prettier --write"]
}
```

```sh
# .husky/pre-commit
npx lint-staged

# .husky/commit-msg
npx --no -- commitlint --edit $1
```

**Exemplos de commit válidos:**
```
feat(auth): add JWT refresh token support    → minor bump (1.0.0 → 1.1.0)
fix(api): handle null response               → patch bump (1.0.0 → 1.0.1)
feat!: remove deprecated endpoint           → MAJOR bump (1.0.0 → 2.0.0)
docs: update README                          → sem bump
chore(deps): update eslint to v9             → sem bump
```

### 6.4 — CI e configurações compartilhadas
```yaml
# .github/workflows/quality.yml
jobs:
  quality:
    steps:
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
```

---

## Scripts disponíveis

| Script | Comando | Quando usar |
|--------|---------|-------------|
| `lint` | `eslint src --max-warnings 0` | Desenvolvimento e CI |
| `lint:fix` | `eslint src --fix` | Corrigir automaticamente |
| `format` | `prettier --write "src/**/*"` | Formatar tudo |
| `format:check` | `prettier --check "src/**/*"` | CI — falha se não formatado |
| `typecheck` | `tsc --noEmit` | Checar tipos sem compilar |
| `quality` | typecheck + lint + format:check + test | Antes de abrir PR |

---

## Caso Real — Startup fintech, 8 devs, 4 semanas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo de code review em estilo | 40% | 3% |
| Avisos ESLint | 847 | 12 |
| Erros `==` em produção (6 meses) | 3 | 0 |
| Onboarding de novo dev | 3 dias | 4 horas |
| Commits no padrão Conventional | 0% | 100% |

**Ordem de adoção recomendada:**
1. **Prettier** — impacto imediato, resistência baixa
2. **ESLint** — comece com `warn`, não `error`
3. **Husky + lint-staged** — protege o repositório
4. **CI + .vscode/** — fecha o ciclo

---

## Nota 2026: Oxlint

O **Oxlint** (parte do ecossistema Oxc/Rolldown) está emergindo como alternativa ultra-rápida ao ESLint — 50–100× mais veloz, com compatibilidade crescente de regras. Para projetos novos em 2026, vale acompanhar sua evolução. Para projetos existentes, ESLint com flat config continua sendo a escolha segura.

---

## Recursos

- [ESLint docs](https://eslint.org/docs/latest)
- [Prettier docs](https://prettier.io/docs/en)
- [Husky docs](https://typicode.github.io/husky)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Commitlint](https://commitlint.js.org)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
