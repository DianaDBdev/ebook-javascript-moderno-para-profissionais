// playwright.config.ts — Seção 8.4: Configuração Playwright
// Capítulo 8 — Testing no Mundo Moderno
//
// Instalação:
//   npm install -D @playwright/test
//   npx playwright install  # Baixa Chromium, Firefox, WebKit

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:        './e2e',
  fullyParallel:  true,
  forbidOnly:     !!process.env.CI,   // Proíbe test.only no CI
  retries:        process.env.CI ? 2 : 0,
  workers:        process.env.CI ? 1 : undefined,
  reporter:       'html',

  use: {
    baseURL:   'http://localhost:5173',
    trace:     'on-first-retry',     // Grava trace em falhas
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome']  } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari']  } },
    // Mobile
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  // Sobe o dev server antes dos testes
  webServer: {
    command:             'npm run dev',
    url:                 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});

// ─────────────────────────────────────────────────────────────
// Por que Playwright em vez de Cypress? (seção 8.4)
// ─────────────────────────────────────────────────────────────

// ✅ Playwright vantagens (projetos novos em 2026):
//   • Multi-browser nativo: Chromium, Firefox e WebKit
//   • Sem limitações de iframe e múltiplas abas
//   • Execução paralela nativa por padrão
//   • Melhor suporte a redes móveis e geolocalização
//   • Sem dependência de servidor separado — mais simples no CI
//
// Cypress ainda é excelente para equipes que já o usam.
// Playwright é a recomendação para projetos novos.
