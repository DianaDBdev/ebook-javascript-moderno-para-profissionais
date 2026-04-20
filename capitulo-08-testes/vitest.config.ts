// vitest.config.ts — Seção 8.1: Configuração do Vitest
// Capítulo 8 — Testing no Mundo Moderno
//
// Dois formatos: com Vite (tudo em vite.config.ts) ou standalone.

// ─────────────────────────────────────────────────────────────
// COM VITE — adicionar ao vite.config.ts existente (seção 8.1)
// ─────────────────────────────────────────────────────────────

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// export default defineConfig({
//   plugins: [react()],
//   test: {
//     globals:     true,          // describe/it/expect sem import
//     environment: 'jsdom',       // Para testes de componentes React
//     // setupFiles: ['./src/test/setup.ts'],  // descomente e crie o arquivo em projetos reais
//     coverage: {
//       provider:   'v8',
//       reporter:   ['text', 'html', 'lcov'],
//       exclude:    ['node_modules/', 'src/test/'],
//     }
//   }
// });

// ─────────────────────────────────────────────────────────────
// SEM VITE — arquivo separado (seção 8.1)
// ─────────────────────────────────────────────────────────────

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',        // Para APIs e backends
    // setupFiles: ['./src/test/setup.ts'],  // descomente e crie o arquivo em projetos reais

    // Coverage com thresholds (seção 8.2 + 8.5)
    coverage: {
      provider:   'v8',         // ou 'istanbul'
      reporter:   ['text', 'html', 'lcov'], // lcov para CI/SonarQube/Codecov
      thresholds: {
        lines:      80,         // Falha se < 80% das linhas
        functions:  80,
        branches:   70,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',          // Barrel files — sem lógica
      ],
    },
  },
});

// ─────────────────────────────────────────────────────────────
// src/test/setup.ts — arquivo de setup (seção 8.1)
// ─────────────────────────────────────────────────────────────

// import '@testing-library/jest-dom'; // Matchers extras para DOM
// import { vi } from 'vitest';
//
// // Limpar mocks entre testes
// beforeEach(() => {
//   vi.clearAllMocks();
// });
//
// // Mock global de fetch (se necessário)
// global.fetch = vi.fn();

// ─────────────────────────────────────────────────────────────
// Scripts no package.json (seção 8.1)
// ─────────────────────────────────────────────────────────────

// {
//   "scripts": {
//     "test":          "vitest",
//     "test:run":      "vitest run",          // Roda uma vez e sai
//     "test:coverage": "vitest run --coverage",
//     "test:ui":       "vitest --ui"          // Interface visual no browser
//   }
// }

// ─────────────────────────────────────────────────────────────
// Nota 2026: Vitest Browser Mode (seção 8.1)
// ─────────────────────────────────────────────────────────────

// O Vitest lançou o Browser Mode — testes rodando diretamente no
// browser real, sem JSDOM. Para componentes UI com comportamentos
// específicos de browser, isso elimina uma classe inteira de falsos
// positivos. Vale explorar para projetos que testam interações DOM complexas.
