// destructuring.js — Desestruturação além do básico
// Execute: node 01-destructuring/destructuring.js

// ──────────────────────────────────────────────
// Renomeação + valor padrão
// ──────────────────────────────────────────────
const usuario = { nome: 'Diana', idade: 28, email: 'diana@example.com' };

const { nome: userName, idade: userAge = 18, cargo = 'Desenvolvedor' } = usuario;
console.log(userName, userAge, cargo); // Diana 28 Desenvolvedor

// ──────────────────────────────────────────────
// Desestruturação aninhada
// ──────────────────────────────────────────────
const config = {
  servidor: {
    host: 'localhost',
    porta: 3000,
    ssl: { ativo: true, certificado: '/cert.pem' },
  },
};

const { servidor: { host, porta, ssl: { ativo } } } = config;
console.log(host, porta, ativo); // localhost 3000 true

// ──────────────────────────────────────────────
// Desestruturação em parâmetros de função
// ──────────────────────────────────────────────
function criarUsuario({ nome, email, role = 'user', ativo = true }) {
  return { nome, email, role, ativo, criadoEm: new Date().toISOString() };
}

const novoUsuario = criarUsuario({ nome: 'Diana', email: 'diana@db.dev' });
console.log(novoUsuario);

// ──────────────────────────────────────────────
// Array destructuring com skip
// ──────────────────────────────────────────────
const [primeiro, , terceiro, quarto = 'padrão'] = ['a', 'b', 'c'];
console.log(primeiro, terceiro, quarto); // a c padrão

// Swap de variáveis sem temp
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1

// ──────────────────────────────────────────────
// Rest em desestruturação
// ──────────────────────────────────────────────
const { id, ...semId } = { id: 1, nome: 'Diana', email: 'diana@db.dev' };
console.log('sem id:', semId); // { nome, email }

const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head, tail); // 1 [2,3,4,5]
