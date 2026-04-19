// antipadroes.js — Seção 2.6: Antipadrões comuns e como evitá-los
// Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça
//
// Execute: node exemplos/antipadroes.js

// ─────────────────────────────────────────────────────────────
// Stubs
// ─────────────────────────────────────────────────────────────
const users = [{ id: 1, name: 'Diana' }, { id: 2, name: 'Victor' }];
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));
const fetchUser    = (id) => delay(10, users.find(u => u.id === id) || null);
const fetchPosts   = () => delay(10, [{ id: 1, title: 'Post 1' }]);
const fetchComments= () => delay(10, [{ id: 1, text: 'Comentário' }]);
const processUser  = (u) => delay(5, { ...u, processed: true });

// ─────────────────────────────────────────────────────────────
// Antipadrão 1: Async sem await — overhead desnecessário
// ─────────────────────────────────────────────────────────────

// ❌ Async sem await — adiciona overhead sem necessidade
// async function getUserBad(id) {
//   return users.find(u => u.id === id);
// }

// ✅ Correto — sem overhead desnecessário
function getUser(id) {
  return users.find(u => u.id === id);
}
// 💡 Funções async sempre retornam Promise — evite quando não há operação assíncrona real.

// ─────────────────────────────────────────────────────────────
// Antipadrão 2: Await em loops — a armadilha da lentidão
// ─────────────────────────────────────────────────────────────

// ❌ Sequencial desnecessário — 100 usuários × 200 ms = 20 segundos!
async function processUsersSequencial(userIds) {
  const results = [];
  for (const id of userIds) {
    const user = await fetchUser(id); // Espera cada um
    results.push(user);
  }
  return results;
}

// ✅ Paralelo — 100 usuários = ~200 ms (todos juntos)
async function processUsers(userIds) {
  return Promise.all(userIds.map(id => fetchUser(id)));
}

// Quando sequencial é correto: quando cada operação depende do resultado da anterior.
// ✅ Sequencial proposital
async function migrateData() {
  await backupDatabase();    // Precisa completar primeiro
  await runMigrations();     // Precisa do backup
  await validateMigration(); // Precisa da migration
}
async function backupDatabase()    { return delay(5, 'backup ok'); }
async function runMigrations()     { return delay(5, 'migrations ok'); }
async function validateMigration() { return delay(5, 'valid ok'); }

// ─────────────────────────────────────────────────────────────
// Antipadrão 3: Try/catch em excesso
// ─────────────────────────────────────────────────────────────

// ❌ Try/catch para cada await — verboso e repetitivo
// async function loadDataVerboso() {
//   let user, posts, comments;
//   try { user     = await fetchUser(1);    } catch (e) { /* ... */ }
//   try { posts    = await fetchPosts();    } catch (e) { /* ... */ }
//   try { comments = await fetchComments(); } catch (e) { /* ... */ }
//   return { user, posts, comments };
// }

// ✅ Agrupe quando faz sentido — Promise.allSettled para tolerância a falhas
async function loadData() {
  try {
    const [user, posts, comments] = await Promise.allSettled([
      fetchUser(1), fetchPosts(), fetchComments()
    ]);
    return {
      user:     user.status     === 'fulfilled' ? user.value     : null,
      posts:    posts.status    === 'fulfilled' ? posts.value    : [],
      comments: comments.status === 'fulfilled' ? comments.value : []
    };
  } catch (err) { // Promise.allSettled nunca rejeita — este catch é opcional, mas mantém consistência
    console.error('Falha crítica:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Antipadrão 4: Misturar async/await com .then()
// ─────────────────────────────────────────────────────────────

// ❌ Confuso e inconsistente
// async function getDataMisto() {
//   const user = await fetchUser(1);
//   return fetchPosts(user.id)
//     .then(posts => posts.map(p => p.title)); // Por que .then() aqui?
// }

// ✅ Consistente
async function getData() {
  const user  = await fetchUser(1);
  const posts = await fetchPosts();
  return posts.map(p => p.title);
}

// Exceção aceitável: .then() para transformações inline simples:
// const titles = await fetchPosts().then(posts => posts.map(p => p.title));

// ─────────────────────────────────────────────────────────────
// Antipadrão 5: Esquecer de retornar
// ─────────────────────────────────────────────────────────────

// ❌ Não retorna a promise — termina antes de processar
// async function saveUserBad(user) {
//   processUser(user); // Esqueceu await e return!
// }
// await saveUserBad(user);
// console.log('Salvo!'); // Mentira — ainda processando em background

// ✅ Correto
async function saveUser(user) {
  return processUser(user);
}

// ─────────────────────────────────────────────────────────────
// Antipadrão 6: Criar promises desnecessárias (new Promise wrapper)
// ─────────────────────────────────────────────────────────────

// ❌ Promise wrapper desnecessário
// async function getUserWrapped(id) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const user = await fetchUser(id);
//       resolve(user);
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// ✅ Async/await já retorna promise — simples e direto
async function getUserSimples(id) {
  return fetchUser(id);
}

// ─────────────────────────────────────────────────────────────
// Retry com exponential backoff — do Caso Real (seção 2.6)
// ─────────────────────────────────────────────────────────────

async function processImageWithRetry(imageUrl, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Tentativa ${attempt}/${maxRetries}`);
      return await processImage(imageUrl);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}
const processImage = async (url) => delay(5, `processed:${url}`);

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
console.log('=== Antipadrão 2: Sequencial vs Paralelo ===');
const t1 = Date.now();
await processUsersSequencial([1, 2]);
console.log(`Sequencial: ${Date.now() - t1}ms`);

const t2 = Date.now();
await processUsers([1, 2]);
console.log(`Paralelo:   ${Date.now() - t2}ms`);

console.log('\n=== Antipadrão 3: Promise.allSettled ===');
const data = await loadData();
console.log('loadData():', JSON.stringify(data));

console.log('\n=== Antipadrão 4: Consistência async/await ===');
const titles = await getData();
console.log('getData():', titles);

console.log('\n=== Antipadrão 5: saveUser com return ===');
const saved = await saveUser({ id: 1, name: 'Diana' });
console.log('saveUser():', saved);

console.log('\n=== processImageWithRetry ===');
const imgResult = await processImageWithRetry('https://example.com/img.jpg', 2);
console.log('processImageWithRetry():', imgResult);
