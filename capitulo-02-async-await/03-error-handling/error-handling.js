// error-handling.js — try/catch vs .catch() vs wrapper utilitário
// Execute: node 03-error-handling/error-handling.js

// ──────────────────────────────────────────────
// Padrão 1: try/catch (preferido com async/await)
// ──────────────────────────────────────────────
async function buscarUsuario(id) {
  try {
    // Simulando uma requisição que pode falhar
    if (id <= 0) throw new Error('ID inválido');
    return { id, nome: 'Diana' };
  } catch (err) {
    console.error(`[buscarUsuario] Erro: ${err.message}`);
    return null; // retorna null em vez de propagar o erro
  }
}

// ──────────────────────────────────────────────
// Padrão 2: wrapper utilitário — evita try/catch repetitivo
// ──────────────────────────────────────────────

/**
 * Executa uma Promise e retorna [error, data] ao estilo Go.
 * Elimina try/catch repetitivo em toda a aplicação.
 */
async function to(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, null];
  }
}

// Uso:
const [err, usuario] = await to(buscarUsuario(1));
if (err) {
  console.error('Falhou:', err.message);
} else {
  console.log('Usuário:', usuario);
}

const [err2, invalido] = await to(buscarUsuario(-1));
console.log('Resultado com ID inválido:', { err2: err2?.message, invalido });

// ──────────────────────────────────────────────
// ⚠️ Antipadrão: swallowing errors silenciosamente
// ──────────────────────────────────────────────
async function antipadrao() {
  try {
    await Promise.reject(new Error('Erro crítico'));
  } catch {
    // ❌ Nunca faça isso — o erro desaparece sem rastro
  }
}
