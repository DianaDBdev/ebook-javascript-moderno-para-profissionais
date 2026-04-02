// eslint.config.js — Flat config (ESLint 9+)
// Capítulo 6 — Configuração recomendada para times

import js        from '@eslint/js';
import tsPlugin  from '@typescript-eslint/eslint-plugin';
import tsParser  from '@typescript-eslint/parser';
import globals   from 'globals';

export default [
  // ──────────────────────────────────────────────
  // Ignores globais
  // ──────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // ──────────────────────────────────────────────
  // JavaScript base (todos os .js)
  // ──────────────────────────────────────────────
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console':   'warn',          // avisa sobre console.log em produção
      'no-debugger':  'error',
      'prefer-const': 'error',         // sempre const quando possível
      'no-var':       'error',         // proíbe var
      'eqeqeq':       ['error', 'always'], // === obrigatório
    },
  },

  // ──────────────────────────────────────────────
  // TypeScript
  // ──────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any':      'error',   // proíbe any
      '@typescript-eslint/no-unused-vars':       'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // ?? em vez de ||
      '@typescript-eslint/prefer-optional-chain':    'warn', // ?. em vez de &&
    },
  },

  // ──────────────────────────────────────────────
  // Arquivos de teste — regras mais relaxadas
  // ──────────────────────────────────────────────
  {
    files: ['**/*.{test,spec}.{ts,js}', '**/__tests__/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
