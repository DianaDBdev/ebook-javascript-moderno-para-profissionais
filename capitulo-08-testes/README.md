# Capítulo 8 — Testing no Mundo Moderno

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Vitest: configuração mínima, TypeScript e ESM nativos, API idêntica ao Jest
- Mocks com `vi.fn()`, `vi.spyOn()`, `vi.mock()` — padrões completos
- Migração Jest → Vitest: script automático e diferenças de API
- Testing Library: teste comportamento, não implementação
- Playwright: E2E com Page Object Model, fixtures e CI
- Coverage que importa: metas por camada, mutation testing com Stryker
- Caso Real: de 0% para 68% em 6 semanas, 11 bugs críticos detectados

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`vitest.config.ts`](vitest.config.ts) | 8.1 | Config Vitest standalone e com Vite, setup file, coverage thresholds, Browser Mode nota 2026 |
| [`exemplos/vitest-basico.test.ts`](exemplos/vitest-basico.test.ts) | 8.1 | **20 testes executáveis**: `formatCurrency`, mocks (`vi.fn/spyOn/mock`), async, matchers, `calculateTax`, Exercício 1 `calculateBulkDiscount` |
| [`exemplos/migration-jest-vitest.ts`](exemplos/migration-jest-vitest.ts) | 8.2 | Quando manter Jest, mapeamento de API Jest→Vitest, passos da migração, coverage config com thresholds |
| [`exemplos/testing-library.test.tsx`](exemplos/testing-library.test.tsx) | 8.3 | Filosofia comportamento vs implementação, queries (prioridade getByRole), variantes, userEvent, formulário completo, custom render com providers |
| [`exemplos/playwright.config.ts`](exemplos/playwright.config.ts) | 8.4 | Config completa: multi-browser, CI, trace, webServer, Playwright vs Cypress |
| [`exemplos/playwright.spec.ts`](exemplos/playwright.spec.ts) | 8.4 | Testes E2E, Page Object Model (`LoginPage`), fixtures de autenticação, fluxo de pagamento, CI GitHub Actions |
| [`exemplos/coverage-strategy.ts`](exemplos/coverage-strategy.ts) | 8.5 | Problema com 100%, metas por camada, mutation testing Stryker, pirâmide moderna, o que testar, Caso Real |

---

## Como executar

```bash
cd capitulo-08-testes
npm install   # instala vitest + tsx

# Testes unitários executáveis (20 testes)
npx vitest run exemplos/vitest-basico.test.ts

# Demo: migração Jest → Vitest
npx tsx exemplos/migration-jest-vitest.ts

# Demo: estratégia de coverage
npx tsx exemplos/coverage-strategy.ts
```

> `testing-library.test.tsx` e `playwright.spec.ts` precisam de uma app React e server rodando respectivamente — servem como referência de código.

---

## Mapa de exemplos por seção

### 8.1 — Vitest: anatomia de testes

```ts
describe('formatCurrency', () => {
  it('formata valor positivo em reais', () => {
    expect(formatCurrency(1500)).toBe('R$\u00a01.500,00');
  });
  it('lança erro para valor negativo', () => {
    expect(() => formatCurrency(-1)).toThrow('Valor não pode ser negativo');
  });
});

// Mocks
const mockSave = vi.fn().mockResolvedValue({ id: 1, name: 'Maria' });
await mockSave({ name: 'Maria' });
expect(mockSave).toHaveBeenCalledWith({ name: 'Maria' });

// Testes assíncronos
await expect(service.create(input)).rejects.toThrow('Email already registered');
expect(user).not.toHaveProperty('password'); // Nunca expor senha
```

### 8.2 — Migração Jest → Vitest

```
jest.fn()            → vi.fn()
jest.spyOn()         → vi.spyOn()
jest.mock()          → vi.mock()
jest.useFakeTimers() → vi.useFakeTimers()
jest.clearAllMocks() → vi.clearAllMocks()
```

### 8.3 — Testing Library: comportamento vs implementação

```ts
// ❌ Frágil — testa detalhe interno
expect(result.current.count).toBe(1); // quebra se renomear 'count'

// ✅ Resiliente — testa comportamento do usuário
await userEvent.click(screen.getByRole('button', { name: /incrementar/i }));
expect(screen.getByText('1')).toBeInTheDocument();
```

**Prioridade de queries:** `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (último recurso)

### 8.4 — Playwright E2E

```ts
// Page Object Model
export class LoginPage {
  constructor(private readonly page: Page) {
    this.emailInput   = page.getByLabel('Email');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
  }
  async login(email: string, password: string) { ... }
}

// Fixture reutilizável de autenticação
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await loginPage.login('admin@ex.com', 'admin123');
    await use(); // roda o teste autenticado
  }
});
```

### 8.5 — Coverage que importa

| Camada | Meta | Motivo |
|--------|------|--------|
| Lógica de negócio (entidades, use cases) | 90–100% | Bugs custam mais aqui |
| Serviços e utilitários | 80–90% | Alto impacto |
| Componentes UI | 70–80% | Foque nos fluxos críticos |
| Configs e barrels | excluir | Sem lógica |

```bash
npx stryker run  # Mutation testing — verifica se testes detectam bugs reais
```

---

## Caso Real — Plataforma SaaS, 6 semanas, de 0%

| Métrica | Antes | Depois |
|---------|-------|--------|
| Coverage backend | 0% | 68% |
| Coverage frontend | 0% | 54% |
| Bugs de regressão/semana | 2–3 | 0,3 |
| Tempo de QA manual/deploy | 3h | 30min |
| Bugs detectados antes da produção | 0 | 11 (3 críticos) |

**Distribuição final:** 47 unitários + 83 integração + 12 E2E

**Estratégia:** Começar pelo que dói mais → calculos financeiros (3 bugs encontrados na primeira semana).

---

## Nota 2026: Vitest Browser Mode

O Vitest lançou o Browser Mode — testes rodando diretamente no browser real, sem JSDOM. Para componentes UI com comportamentos específicos de browser, isso elimina uma classe inteira de falsos positivos.

---

## Recursos

- [Vitest docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright docs](https://playwright.dev)
- [Kent C. Dodds — Testing JavaScript](https://testingjavascript.com)
- [Stryker Mutator](https://stryker-mutator.io)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
