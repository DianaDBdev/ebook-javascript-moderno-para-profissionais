// antipadroes.js — O que NÃO fazer com async/await
// Execute: node 05-antipadroes/antipadroes.js

// ──────────────────────────────────────────────
// ❌ Antipadrão 1: await em loop sequencial desnecessário
// ──────────────────────────────────────────────
const delay = (ms) => new Promise(res => setTimeout(res, ms));

console.log('--- Antipadrão: await em loop ---');
const ids = [1, 2, 3, 4, 5];

// ❌ Lento: cada busca espera a anterior terminar (sequencial)
console.time('sequencial');
for (const id of ids) {
  await delay(50); // simula fetch
}
console.timeEnd('sequencial'); // ~250ms

// ✅ Rápido: todas as buscas em paralelo
console.time('paralelo');
await Promise.all(ids.map(() => delay(50)));
console.timeEnd('paralelo'); // ~50ms

// ──────────────────────────────────────────────
// ❌ Antipadrão 2: new Promise() desnecessário (Promise wrapper)
// ──────────────────────────────────────────────

// ❌ Errado — envolvendo uma Promise em outra Promise
async function buscarDados_errado(id) {
  return new Promise(async (resolve, reject) => { // ← never do this
    try {
      const resultado = await delay(10);
      resolve(resultado);
    } catch (err) {
      reject(err);
    }
  });
}

// ✅ Correto — async/await já lida com Promises nativamente
async function buscarDados_correto(id) {
  await delay(10);
  return { id };
}

// ──────────────────────────────────────────────
// ❌ Antipadrão 3: esquecer await (bug silencioso)
// ──────────────────────────────────────────────

async function salvar(dados) {
  await delay(10);
  return true;
}

// ❌ Sem await — a função retorna uma Promise não resolvida
const resultado1 = salvar({ nome: 'teste' }); // Promise { <pending> }
console.log('Sem await:', resultado1);         // Promise, não true!

// ✅ Com await
const resultado2 = await salvar({ nome: 'teste' });
console.log('Com await:', resultado2);          // true
