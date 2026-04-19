// migrate-imports.js — Caso Real: Script de migração Webpack → Vite
// Capítulo 4 — Build Tools: Além do Webpack
//
// Script real usado na migração do admin dashboard (seção 4.7 do capítulo).
// Adiciona extensões .jsx/.js em imports relativos sem extensão.
//
// Execute:
//   node exemplos/migrate-imports.js              (dry-run — mostra o que mudaria)
//   node exemplos/migrate-imports.js --apply      (aplica as mudanças)

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const APPLY      = process.argv.includes('--apply');

// ─────────────────────────────────────────────────────────────
// Contexto do Caso Real (seção migração do capítulo)
// ─────────────────────────────────────────────────────────────
//
// Projeto: admin dashboard com React, 3 anos de idade, Webpack config de 400 linhas
// Problema encontrado no Passo 5 da migração:
//
//   // ❌ Funcionava no Webpack (resolvia sem extensão automaticamente)
//   import Button from './Button';
//   import utils  from '../utils';
//
//   // ✅ Vite precisa da extensão explícita
//   import Button from './Button.jsx';
//   import utils  from '../utils.js';
//
// Com 150+ componentes, fazer isso manualmente levaria horas.
// Este script automatizou a migração em < 1 minuto.

// ─────────────────────────────────────────────────────────────
// Script de migração
// ─────────────────────────────────────────────────────────────

/**
 * Encontra todos os .js e .jsx recursivamente em um diretório.
 */
function findJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      findJsFiles(full, files);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Adiciona extensão .jsx ou .js a imports relativos sem extensão.
 * Retorna o conteúdo modificado (ou o original se não houve mudança).
 */
function addExtensionsToImports(content, fileDir) {
  return content.replace(
    /from\s+['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      // Já tem extensão — não mexe
      if (/\.(jsx?|tsx?|css|json|svg|png|jpg|webp)$/.test(importPath)) {
        return match;
      }
      // Tenta .jsx primeiro, depois .js
      const jsxPath = path.join(fileDir, importPath + '.jsx');
      const jsPath  = path.join(fileDir, importPath + '.js');
      if (fs.existsSync(jsxPath)) return `from '${importPath}.jsx'`;
      if (fs.existsSync(jsPath))  return `from '${importPath}.js'`;
      // Pode ser um diretório com index
      const indexJsx = path.join(fileDir, importPath, 'index.jsx');
      const indexJs  = path.join(fileDir, importPath, 'index.js');
      if (fs.existsSync(indexJsx)) return `from '${importPath}/index.jsx'`;
      if (fs.existsSync(indexJs))  return `from '${importPath}/index.js'`;
      return match; // Não encontrou — mantém original
    }
  );
}

/**
 * Substitui process.env.REACT_APP_ por import.meta.env.VITE_
 * (Passo 7 do Caso Real — Create React App → Vite)
 */
function migrateEnvVars(content) {
  return content.replace(
    /process\.env\.REACT_APP_(\w+)/g,
    'import.meta.env.VITE_$1'
  );
}

// ─────────────────────────────────────────────────────────────
// Executar migração
// ─────────────────────────────────────────────────────────────

// Para uso real, aponte para o diretório src do seu projeto:
// const srcDir = path.resolve(__dirname, '../../src');

// Para demo, usamos o próprio diretório de exemplos:
const srcDir = path.resolve(__dirname, '..');

const files        = findJsFiles(srcDir);
let   totalChanged = 0;
let   totalFiles   = 0;

console.log(`Analisando ${files.length} arquivo(s) em ${srcDir}...`);
console.log(APPLY ? '⚡ MODO APPLY — aplicando mudanças\n' : '👁️  MODO DRY-RUN — apenas mostrando mudanças\n');

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let modified   = addExtensionsToImports(original, path.dirname(file));
  modified       = migrateEnvVars(modified);

  if (modified !== original) {
    totalFiles++;
    const relPath = path.relative(srcDir, file);

    // Mostrar diferenças linha a linha
    const origLines = original.split('\n');
    const modLines  = modified.split('\n');
    console.log(`📝 ${relPath}:`);
    origLines.forEach((line, i) => {
      if (line !== modLines[i]) {
        totalChanged++;
        console.log(`  - ${line.trim()}`);
        console.log(`  + ${modLines[i].trim()}`);
      }
    });
    console.log();

    if (APPLY) {
      fs.writeFileSync(file, modified);
    }
  }
}

console.log('─'.repeat(50));
if (totalFiles === 0) {
  console.log('✅ Nenhuma alteração necessária — todos os imports já têm extensão.');
} else {
  console.log(`${APPLY ? '✅ Aplicadas' : '📋 Encontradas'} ${totalChanged} mudança(s) em ${totalFiles} arquivo(s).`);
  if (!APPLY) {
    console.log('\nPara aplicar: node exemplos/migrate-imports.js --apply');
  }
}

// ─────────────────────────────────────────────────────────────
// Outros passos do Caso Real (referência)
// ─────────────────────────────────────────────────────────────

// Passo 1: Análise de dependências
//   npm list webpack-dev-server && npm list babel-loader

// Passo 2: Instalar Vite
//   npm install -D vite @vitejs/plugin-react

// Passo 3: Criar vite.config.js (ver ../vite.config.js — De 400 → 35 linhas)

// Passo 4: Mover o index.html
//   mv public/index.html ./index.html
//   # Adicionar: <script type="module" src="/src/index.jsx"></script>

// Passo 5: Ajustar imports (este script)

// Passo 6: SASS/CSS Modules — funcionam automaticamente:
//   npm install -D sass  (e funciona sem configuração adicional)

// Passo 7: Variáveis de ambiente (este script — migrateEnvVars)
//   REACT_APP_API_URL → VITE_API_URL
//   process.env.REACT_APP_ → import.meta.env.VITE_

// Passo 8: Ajustar scripts npm
//   "dev": "vite", "build": "vite build", "preview": "vite preview"

// Passo 9: Migrar testes Jest → Vitest
//   npm install -D vitest @testing-library/react jsdom

// Passo 10: Remover dependências antigas
//   npm uninstall webpack webpack-cli webpack-dev-server babel-loader ...
//   # package.json: de 45 devDependencies para 12

// RESULTADO DA MIGRAÇÃO:
//   Dev server:  45s → 1,2s (-97%)
//   HMR:         3–5s → <100ms (-98%)
//   Build:       4min → 1,5min (-62%)
//   Config:      400 linhas → 35 linhas (-91%)
//   devDeps:     45 → 12 pacotes (-73%)

// RESULTADOS EXATOS DA MIGRAÇÃO (referência rápida):
//   Dev server: 45s → 1,2 s de inicialização (-97%)
//   HMR:        3–5s → <100ms (-98%)
//   Build:      4min → 1,5min (-62%)
//
// require.context (Webpack-specific) → import.meta.glob (Vite):
//   // ❌ Webpack-specific
//   const images = require.context('./images', false, /\.png$/);
//   // ✅ Vite glob
//   const images = import.meta.glob('./images/*.png', { eager: true });
