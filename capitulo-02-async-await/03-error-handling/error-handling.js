// error-handling.js — Seção 2.3: Error handling com try/catch vs .catch()
// Capítulo 2 — Async/Await: Programação Assíncrona Sem Dor de Cabeça
//
// Execute: node exemplos/error-handling.js

// ─────────────────────────────────────────────────────────────
// 1. .catch() vs try/catch — o mesmo fluxo, estilos diferentes
// ─────────────────────────────────────────────────────────────

// Com Promises (.catch):
// function loadUserData(userId) {
//   return fetchUser(userId)
//     .then(user  => fetchUserPosts(user.id))
//     .then(posts => fetchPostComments(posts))
//     .then(comments => processComments(comments))
//     .catch(err => {
//       // Onde o erro aconteceu? Difícil saber sem investigar
//       console.error('Algo deu errado:', err);
//     });
// }

// Com Async/Await (try/catch):
async function loadUserData(userId) {
  try {
    const user     = await fetchUser(userId);
    const posts    = await fetchUserPosts(user.id);
    const comments = await fetchPostComments(posts);
    return await processComments(comments);
  } catch (err) {
    // Stack trace mostra exatamente onde falhou
    console.error('Erro ao carregar dados:', err.message);
    throw err; // Re-throw se necessário
  }
}

// 💡 Vantagem: o stack trace é preservado, tornando a depuração muito mais fácil.

// ─────────────────────────────────────────────────────────────
// 2. Error handling granular — quando cada operação falha diferente
// ─────────────────────────────────────────────────────────────

async function complexOperation(userId) {
  let user, posts, comments;

  try {
    user = await fetchUser(userId);
  } catch (err) {
    console.error('Falha ao buscar usuário:', err.message);
    return { error: 'USER_NOT_FOUND' };
  }

  try {
    posts = await fetchUserPosts(user.id);
  } catch (err) {
    console.error('Falha ao buscar posts:', err.message);
    posts = []; // Continua mesmo sem posts
  }

  try {
    comments = await fetchPostComments(posts);
  } catch (err) {
    console.error('Falha ao buscar comentários:', err.message);
    comments = [];
  }

  return { user, posts, comments };
}

// ─────────────────────────────────────────────────────────────
// 3. finally para cleanup — sempre executa, com ou sem erro
// ─────────────────────────────────────────────────────────────

async function uploadFile(file) {
  const tempPath = await createTempFile();
  try {
    await processFile(file, tempPath);
    await uploadToS3(tempPath);
    return { success: true };
  } catch (err) {
    console.error('Upload falhou:', err.message);
    return { success: false, error: err.message };
  } finally {
    await deleteTempFile(tempPath); // SEMPRE executa
    console.log('Limpeza concluída');
  }
}

// Casos de uso do finally:
//   • Fechar conexões de banco de dados
//   • Deletar arquivos temporários
//   • Liberar recursos alocados
//   • Logging de fim de operação

// ─────────────────────────────────────────────────────────────
// 4. Erro comum: esquecer o await
// ─────────────────────────────────────────────────────────────

// ❌ Errado — esqueceu o await, erro nunca capturado pelo try/catch
// async function buggyFunction() {
//   try {
//     fetchData(); // Promise disparada, erro não capturado
//   } catch (err) {
//     console.error(err); // Nunca executa
//   }
// }

// ✅ Correto
// async function correctFunction() {
//   try {
//     await fetchData();
//   } catch (err) {
//     console.error(err);
//   }
// }

// ─────────────────────────────────────────────────────────────
// 5. Padrões úteis — do Caso Real (seção 2.6)
// ─────────────────────────────────────────────────────────────

// Timeout wrapper reutilizável
function withTimeout(promise, timeoutMs, errorMessage) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// Retry genérico com exponential backoff
async function retry(fn, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2, onRetry = () => {} } = options;
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (err) {
      lastError = err;
      if (attempt < retries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry(attempt, waitTime, err);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────
// Stubs para demo
// ─────────────────────────────────────────────────────────────
async function fetchUser(id)         { return { id, name: 'Diana' }; }
async function fetchUserPosts(id)    { return [{ id: 1, title: 'Post 1' }]; }
async function fetchPostComments(p)  { return [{ id: 1, text: 'Comentário' }]; }
async function processComments(c)    { return c; }
async function createTempFile()      { return '/tmp/upload_' + Date.now(); }
async function processFile(f, p)     { /* stub */ }
async function uploadToS3(p)         { return 'https://s3.example.com/file'; }
async function deleteTempFile(p)     { /* stub */ }

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
console.log('=== loadUserData (try/catch) ===');
const dados = await loadUserData(42);
console.log('Resultado:', JSON.stringify(dados));

console.log('\n=== withTimeout ===');
try {
  await withTimeout(
    new Promise(resolve => setTimeout(() => resolve('ok'), 100)),
    2000,
    'Timeout!'
  );
  console.log('Completou antes do timeout ✅');
} catch (e) {
  console.log('Timeout ❌:', e.message);
}

console.log('\n=== retry ===');
let tentativas = 0;
const resultado = await retry(
  async () => {
    tentativas++;
    if (tentativas < 3) throw new Error(`Falha tentativa ${tentativas}`);
    return 'sucesso na tentativa 3';
  },
  { retries: 3, delay: 10, onRetry: (a, d, e) => console.log(`  Retry ${a}: ${e.message}`) }
);
console.log('retry resultado:', resultado);

// ─────────────────────────────────────────────────────────────
// Exemplos de uso dos utilitários (seção 2.6 do livro)
// ─────────────────────────────────────────────────────────────

// withTimeout em uso:
//   const data = await withTimeout(
//     fetch('https://api.example.com/slow'),
//     5000,
//     'API timeout after 5 s'
//   );

// retry em uso com onRetry:
//   const data = await retry(
//     () => fetch('https://api.example.com/data'),
//     { retries: 5, delay: 1000, backoff: 2,
//       onRetry: (attempt, delay, err) =>
//         console.log(`Retry ${attempt} após ${delay}ms: ${err.message}`) }
//   );

// ─────────────────────────────────────────────────────────────
// Depurando Async/Await (seção 2.6)
// ─────────────────────────────────────────────────────────────

// Dica 1: console.trace() para ver o stack completo
// async function debugableFunction() {
//   console.trace('Chegou aqui'); // Mostra toda a call stack
//   const data = await fetchData();
//   return data;
// }

// Dica 2: Async Stack Traces no Chrome DevTools
// Nas versões modernas do Chrome, "Async Stack Traces" já vem habilitado por padrão.
// Ele permite ver a cadeia completa de chamadas assíncronas,
// incluindo o contexto antes de cada await.

// Dica 3: Breakpoints estratégicos
// Coloque breakpoints na linha do await — o debugger pausa antes e depois da operação.

// Dica 4: Logging com timestamps
function log(message, data) {
  console.log(`[${new Date().toISOString()}] ${message}`, data ?? '');
}
// log('Iniciando fetch', { userId: 123 });
// log('Fetch completo', { duration: Date.now() - start });
// timestamps no logging facilitam correlacionar eventos assíncronos
