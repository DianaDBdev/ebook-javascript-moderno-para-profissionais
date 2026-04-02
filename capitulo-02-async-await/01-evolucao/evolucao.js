// evolucao.js — A jornada: callbacks → promises → async/await
// Execute: node 01-evolucao/evolucao.js

import { readFile, writeFile } from 'fs/promises';

// ──────────────────────────────────────────────
// ERA 1: Callbacks (evite hoje)
// ──────────────────────────────────────────────
function exemploCallback() {
  console.log('\n--- ERA 1: Callback Hell ---');
  // Código com callbacks aninhados é difícil de ler e manter.
  // Veja a versão equivalente com async/await abaixo.
  setTimeout(() => {
    console.log('Passo 1');
    setTimeout(() => {
      console.log('Passo 2');
      setTimeout(() => {
        console.log('Passo 3 — Pirâmide da perdição ☠️');
      }, 100);
    }, 100);
  }, 100);
}

// ──────────────────────────────────────────────
// ERA 2: Promises com .then()
// ──────────────────────────────────────────────
function exemploPromises() {
  console.log('\n--- ERA 2: Promises ---');
  return Promise.resolve('dados')
    .then(dados => `processado: ${dados}`)
    .then(resultado => `salvo: ${resultado}`)
    .then(console.log)
    .catch(err => console.error('Erro:', err));
}

// ──────────────────────────────────────────────
// ERA 3: Async/Await — legível e linear
// ──────────────────────────────────────────────
async function exemploAsyncAwait() {
  console.log('\n--- ERA 3: Async/Await ✅ ---');
  try {
    const dados     = await Promise.resolve('dados');
    const resultado = `processado: ${dados}`;
    const salvo     = `salvo: ${resultado}`;
    console.log(salvo);
  } catch (err) {
    console.error('Erro:', err);
  }
}

exemploCallback();
await exemploPromises();
await exemploAsyncAwait();
