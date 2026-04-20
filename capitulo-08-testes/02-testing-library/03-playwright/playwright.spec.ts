// playwright.spec.ts — Seção 8.4: E2E com Playwright (POM + fixtures + CI)
// Capítulo 8 — Testing no Mundo Moderno
//
// Execute (com server rodando): npx playwright test

import { test as base, expect, Page, Locator } from '@playwright/test';

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.4 — Page Object Model (POM)
// ─────────────────────────────────────────────────────────────

// POM encapsula seletores e ações de uma página —
// evita duplicação e torna os testes mais legíveis.

// e2e/pages/LoginPage.ts
export class LoginPage {
  readonly emailInput:    Locator;
  readonly passwordInput: Locator;
  readonly submitButton:  Locator;
  readonly errorMessage:  Locator;

  constructor(private readonly page: Page) {
    this.emailInput    = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Senha');
    this.submitButton  = page.getByRole('button', { name: 'Entrar' });
    this.errorMessage  = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.4 — Fixtures reutilizáveis
// ─────────────────────────────────────────────────────────────

// Fixture que autentica antes de cada teste que precisar
export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@ex.com', 'admin123');
    await page.waitForURL('/dashboard');
    await use(); // Executa o teste com a página autenticada
  },
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.4 — Testes E2E
// ─────────────────────────────────────────────────────────────

// Nota: estes testes requerem a aplicação rodando em localhost:5173.
// Para rodar em CI, use o webServer na playwright.config.ts.

test.describe('Autenticação', () => {
  test('login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('maria@ex.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Bem-vindo, Maria!')).toBeVisible();
  });

  // Usando o POM — mais legível e sem duplicação
  test('exibe erro para senha incorreta', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('maria@ex.com', 'senhaerrada');
    await expect(loginPage.errorMessage).toContainText('Credenciais inválidas');
  });
});

// Usando fixture — já começa autenticado
test('admin vê lista de usuários', async ({ page, authenticatedPage }) => {
  await page.goto('/admin/users');
  await expect(page.getByRole('table')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────
// CASO REAL — Fluxo de pagamento (Seção 8.5)
// ─────────────────────────────────────────────────────────────

test('fluxo completo de pagamento', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByLabel('Email').fill('teste@empresa.com');
  await page.getByLabel('Senha').fill('senha_teste');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Navegar para plano premium
  await page.goto('/planos');
  await page.getByRole('button', { name: 'Assinar Premium' }).click();

  // Preencher pagamento
  // 4111111111111111 = número de cartão de teste padrão Visa
  // nunca use números reais em testes
  await page.getByLabel('Número do cartão').fill('4111111111111111');
  await page.getByLabel('Validade').fill('12/27');
  await page.getByLabel('CVV').fill('123');
  await page.getByRole('button', { name: 'Confirmar assinatura' }).click();

  // Verificar sucesso
  await expect(page.getByText('Assinatura ativada!')).toBeVisible();
  await expect(page).toHaveURL('/dashboard?plan=premium');
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.4 — CI com GitHub Actions
// ─────────────────────────────────────────────────────────────

// .github/workflows/e2e.yml:
// name: E2E Tests
// on: [push, pull_request]
// jobs:
//   e2e:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with: { node-version: '20', cache: 'npm' }
//       - run: npm ci
//       - run: npx playwright install --with-deps
//       - run: npx playwright test
//       - uses: actions/upload-artifact@v4
//         if: failure()
//         with:
//           name: playwright-report
//           path: playwright-report/

// ─────────────────────────────────────────────────────────────
// Quando usar E2E — e quando não usar (seção 8.4)
// ─────────────────────────────────────────────────────────────

// ✅ Use E2E para:
//   • Fluxos críticos de negócio — login, checkout, pagamento, cadastro
//   • Integrações frontend + backend em ambiente real
//   • Regressões de bugs que só aparecem com o sistema completo
//   • Smoke tests de deploy — verificar que o ambiente está saudável

// ❌ Não use E2E para:
//   • Lógica de negócio — use testes unitários
//   • Comportamento de componentes isolados — use Testing Library
//   • Validações de formulário — use Testing Library
//   • Cobertura de código — não é o objetivo dos E2E
