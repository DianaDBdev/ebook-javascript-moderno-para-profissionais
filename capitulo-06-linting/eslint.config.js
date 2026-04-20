// eslint.config.js — Seção 6.1: ESLint flat config (TypeScript + React)
// Capítulo 6 — Linting, Formatting e Code Quality
//
// Instalação:
//   npm install -D eslint @eslint/js typescript-eslint
//   npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
//   npm install -D eslint-config-prettier

import js      from '@eslint/js';
import ts      from 'typescript-eslint';
import react   from 'eslint-plugin-react';
// verifique a doc do plugin para a sintaxe exata de flat config — pode variar entre versões
import hooks   from 'eslint-plugin-react-hooks';
import a11y    from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default ts.config(
  // Regras base recomendadas
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': hooks,
      'jsx-a11y':    a11y,
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // ─── TypeScript ───────────────────────────────────────────
      '@typescript-eslint/no-explicit-any':          'warn',
      '@typescript-eslint/no-unused-vars':           'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises':     'error',

      // ─── Bugs potenciais ──────────────────────────────────────
      'no-undef':              'error', // variáveis não declaradas
      'no-unreachable':        'error', // código após return/throw
      'no-constant-condition': 'error', // if (true) { }
      'no-dupe-keys':          'error', // { a: 1, a: 2 }
      'array-callback-return': 'error', // map() sem return
      'no-promise-executor-return': 'error',

      // ─── Boas práticas ────────────────────────────────────────
      'eqeqeq':          'error',  // sempre ===
      'no-eval':         'error',  // eval() é perigoso
      'no-var':          'error',  // sem var
      'prefer-const':    'error',  // const sempre que possível
      'no-console':      'warn',   // avisa sobre console.log
      'no-unused-vars':  'error',
      'no-duplicate-imports': 'error',
      'no-throw-literal': 'error', // throw 'error' → throw new Error()
      'require-await':   'warn',   // async sem await
      // 'no-return-await': 'warn', // cuidado: dentro de try/catch,
      //   return await preserva o stack trace — avalie se faz sentido no seu projeto

      // ─── React ────────────────────────────────────────────────
      'react/react-in-jsx-scope':   'off', // não precisa no React 17+
      'react/prop-types':           'off', // TypeScript já cobre isso
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ─── Acessibilidade ───────────────────────────────────────
      'jsx-a11y/alt-text':  'error',
      'jsx-a11y/aria-props': 'error',
    }
  },
  {
    // Arquivos a ignorar
    ignores: ['dist/', 'node_modules/', '*.min.js']
  },
  // ⚠️ Sempre o último — desativa regras que conflitam com Prettier
  prettier
);

// ─────────────────────────────────────────────────────────────
// Versão JavaScript puro (sem TypeScript/React):
// ─────────────────────────────────────────────────────────────
//
// import js from '@eslint/js';
// export default [
//   js.configs.recommended,
//   {
//     rules: {
//       'no-console':        'warn',
//       'no-unused-vars':    'error',
//       'no-duplicate-imports': 'error',
//       'eqeqeq':            'error',
//       'no-var':            'error',
//       'prefer-const':      'error',
//       'no-throw-literal':  'error',
//       'arrow-body-style':  ['warn', 'as-needed'],
//       'object-shorthand':  'warn',
//     }
//   }
// ];

// ─────────────────────────────────────────────────────────────
// Migração do formato legado (.eslintrc):
// ─────────────────────────────────────────────────────────────
//   npx @eslint/migrate-config .eslintrc.json
//   # Gera eslint.config.mjs equivalente — revise o resultado
//   ⚠️ Plugins antigos podem não ter compatibilidade com flat config ainda.

// ─────────────────────────────────────────────────────────────
// VS Code — .vscode/settings.json:
// ─────────────────────────────────────────────────────────────
//   {
//     "editor.codeActionsOnSave": {
//       "source.fixAll.eslint": "explicit"
//     },
//     "eslint.validate": [
//       "javascript", "javascriptreact",
//       "typescript", "typescriptreact"
//     ]
//   }
