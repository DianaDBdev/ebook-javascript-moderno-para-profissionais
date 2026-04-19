// destructuring.js — Seção 3.1: Destructuring que você realmente precisa conhecer
// Capítulo 3 — Novas Features do ES2015–ES2025
//
// Execute: node exemplos/destructuring.js

// ─────────────────────────────────────────────────────────────
// 1. Básico — array e objeto
// ─────────────────────────────────────────────────────────────

// Array destructuring
const [first, second] = [1, 2, 3];
console.log(first, second); // 1 2

// Object destructuring
const user0 = { name: 'Diana', age: 30 };
const { name: n0, age: a0 } = user0;
console.log(n0, a0); // Diana 30

// ─────────────────────────────────────────────────────────────
// 2. Renomeação — evita conflito com variáveis locais
// ─────────────────────────────────────────────────────────────

const user = { name: 'Maria', age: 25, email: 'maria@example.com' };

// Renomear durante destructuring
const { name: userName, age: userAge } = user;
console.log(userName); // 'Maria'
console.log(userAge);  // 25
// name e age não existem neste escopo

// Quando usar: APIs com nomes genéricos
// const response = await fetch('/api/users');
// const { data: users } = await response.json();
// Agora você tem 'users' em vez de 'data'

// ─────────────────────────────────────────────────────────────
// 3. Valores padrão
// ─────────────────────────────────────────────────────────────

const user1 = { name: 'João' };
const { name: name1, age: age1 = 18 } = user1;
console.log(name1); // 'João'
console.log(age1);  // 18 (valor padrão — age não existe no objeto)

// Poder combinado: renomeação + valor padrão
const config = { timeout: 5000 };
const {
  timeout: requestTimeout = 3000,
  retries: maxRetries     = 3
} = config;
console.log(requestTimeout); // 5000 (do objeto)
console.log(maxRetries);     // 3   (padrão — não existe no objeto)

// ─────────────────────────────────────────────────────────────
// 4. Destructuring aninhado (nested)
// ─────────────────────────────────────────────────────────────

const user2 = {
  name: 'Ana',
  address: { city: 'São Paulo', street: 'Av. Paulista' }
};

const { name: name2, address: { city, street } } = user2;
console.log(city);   // 'São Paulo'
console.log(street); // 'Av. Paulista'
// address NÃO existe como variável neste escopo!

// ⚠️  Se você quiser tanto address quanto suas propriedades, extraia os dois explicitamente:
const { name: name3, address, address: { city: city2 } } = user2;
// válido em ES2015+ — use com moderação, pode confundir em code reviews
console.log(address); // { city: 'São Paulo', street: 'Av. Paulista' }
console.log(city2);   // 'São Paulo'

// ─────────────────────────────────────────────────────────────
// 5. Rest operator em destructuring
// ─────────────────────────────────────────────────────────────

// Em arrays:
const numbers = [1, 2, 3, 4, 5];
const [firstN, secondN, ...rest] = numbers;
console.log(firstN);  // 1
console.log(secondN); // 2
console.log(rest);    // [3, 4, 5]
// ⚠️  O rest operator só funciona no final. [...allButLast, last] causa SyntaxError.

// Em objetos:
const userFull = { name: 'Pedro', age: 30, email: 'pedro@x.com', phone: '99999' };
const { name: nameFull, ...otherInfo } = userFull;
console.log(nameFull);   // 'Pedro'
console.log(otherInfo);  // { age: 30, email: '...', phone: '...' }

// Caso de uso real — remover propriedade antes de enviar:
const userWithPass = { id: 1, name: 'Lucas', email: 'lucas@example.com', password: 'secret' };
const { password, ...safeUser } = userWithPass;
console.log(safeUser); // { id: 1, name: 'Lucas', email: 'lucas@example.com' }
// res.json(safeUser) — nunca expõe a senha

// ─────────────────────────────────────────────────────────────
// 6. Destructuring em parâmetros de função
// ─────────────────────────────────────────────────────────────

// ❌ Antes: você precisava lembrar a ordem
// function createUser(name, age, email, role) { /* ... */ }
// createUser('Maria', 25, 'maria@...', 'admin'); // Qual é qual?

// ✅ Depois: self-documenting
function createUser({ name, age, email, role }) {
  return { name, age, email, role };
}
console.log(createUser({ name: 'Maria', age: 25, email: 'maria@ex.com', role: 'admin' }));

// Com valores padrão e fallback para o objeto inteiro:
function createUser2({ name, age = 18, role = 'user' } = {}) {
  // = {} permite chamar sem argumentos — não quebra!
  console.log(name, age, role);
}
createUser2();                  // undefined, 18, 'user'
createUser2({ name: 'Ana' });   // 'Ana', 18, 'user'

// ─────────────────────────────────────────────────────────────
// 7. Swapping com destructuring
// ─────────────────────────────────────────────────────────────

let a = 1, b = 2;
// ❌ Antes: precisava variável temporária
// let temp = a; a = b; b = temp;

// ✅ Depois: uma linha
[a, b] = [b, a];
console.log(a, b); // 2 1

// ─────────────────────────────────────────────────────────────
// 8. Exercício 1 do capítulo — refatoração com destructuring
// ─────────────────────────────────────────────────────────────

// ❌ Antes
function createUserOld(userData) {
  const name  = userData.name;
  const age   = userData.age || 18;      // ⚠️ use ?? aqui — || converte 0 para 18
  const role  = userData.role || 'user';
  const email = userData.email;
  const city  = userData.address ? userData.address.city : 'Unknown';
  return { name, age, role, email, city };
}

// ✅ Depois — destructuring + optional chaining + ??
function createUserNew({
  name,
  age     = 18,
  role    = 'user',
  email,
  address: { city = 'Unknown' } = {}
} = {}) {
  return { name, age, role, email, city };
}

console.log('\nExercício 1:');
console.log(createUserOld({ name: 'Victor', age: 0, address: { city: 'Belém' } }));
// Problema: age: 0 → 18 (errado com ||)
console.log(createUserNew({ name: 'Victor', age: 0, address: { city: 'Belém' } }));
// Correto: age: 0 preservado
