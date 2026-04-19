// array-methods.js — Seções 3.4, 3.5, 3.6: Template literals, Array methods, Object methods
// Capítulo 3 — Novas Features do ES2015–ES2025
//
// Execute: node exemplos/array-methods.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 3.4 — Template literals e tagged templates
// ─────────────────────────────────────────────────────────────

const nameTpl = 'Maria', ageTpl = 25;

// Interpolação básica
const msg = `Olá, ${nameTpl}! Você tem ${ageTpl} anos.`;
console.log(msg);

// Multi-line
const html = `
<div>
  <h1>Título</h1>
  <p>Parágrafo</p>
</div>`;
console.log(html);

// Expressões dentro de ${}
const items = [1, 2, 3];
const msgItems = `Você tem ${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
console.log(msgItems);

const price = 100;
const total = `Total: R$ ${(price * 1.1).toFixed(2)}`;
console.log(total);

// Tagged templates
function myTag(strings, ...values) {
  console.log('strings:', strings); // ['Olá, ', '! Você tem ', ' anos.']
  console.log('values: ', values);  // ['Maria', 25]
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}
myTag`Olá, ${nameTpl}! Você tem ${ageTpl} anos.`;

// Caso de uso 1: SQL escaping automático
function sql(strings, ...values) {
  const escapeSQL = (v) => String(v).replace(/'/g, "''"); // simplificado
  let query = '';
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) query += `'${escapeSQL(values[i])}'`;
  });
  return query;
}
const userId = "1'; DROP TABLE users--"; // Tentativa de SQL injection
const query  = sql`SELECT * FROM users WHERE id = ${userId}`;
console.log('SQL seguro:', query); // Automaticamente escapado!

// String.raw — ignorar escape sequences:
const path = String.raw`C:\Users\nome\Documents`;
console.log(path); // C:\Users\nome\Documents (não interpreta \n, \t etc.)

// ─────────────────────────────────────────────────────────────
// SEÇÃO 3.5 — Array methods modernos
// ─────────────────────────────────────────────────────────────

// map() — Transformar cada elemento
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
console.log('\nmap doubled:', doubled); // [2, 4, 6, 8]

// Com objetos — adicionar propriedade
const users = [{ name: 'Maria', age: 17 }, { name: 'João', age: 25 },
               { name: 'Ana', age: 30, active: true }, { name: 'Pedro', age: 22, active: true, score: 95 }];
const usersWithId = users.map((user, index) => ({ ...user, id: index + 1 }));
console.log('usersWithId:', usersWithId.map(u => u.id));

// filter() — Filtrar elementos
const evens  = [1, 2, 3, 4, 5, 6].filter(n => n % 2 === 0);
console.log('evens:', evens); // [2, 4, 6]

const adults = users.filter(user => user.age >= 18);
console.log('adults:', adults.map(u => u.name));

// reduce() — Reduzir a um valor
const sum = [1, 2, 3, 4].reduce((acc, n) => acc + n, 0);
console.log('sum:', sum); // 10

// Agrupar por propriedade
const byRole = [
  { name: 'Diana', role: 'admin' },
  { name: 'Victor', role: 'user' },
  { name: 'Ana', role: 'admin' }
].reduce((acc, user) => {
  acc[user.role] = acc[user.role] || [];
  acc[user.role].push(user);
  return acc;
}, {});
console.log('byRole admin:', byRole.admin.map(u => u.name));

// Contar ocorrências:
const fruits = ['apple', 'banana', 'apple', 'orange', 'apple'];
const count  = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log('count:', count); // { apple: 3, banana: 1, orange: 1 }

// flatMap() — map + flatten
const userHobbies = [
  { name: 'Maria', hobbies: ['ler', 'correr'] },
  { name: 'João',  hobbies: ['nadar'] }
];
const allHobbies = userHobbies.flatMap(user => user.hobbies);
console.log('flatMap hobbies:', allHobbies); // ['ler', 'correr', 'nadar']

// Filtrar E transformar em uma passagem:
const result = [1, 2, 3, 4, 5].flatMap(n =>
  n % 2 === 0 ? [n * 2] : []  // Pares: dobra. Ímpares: remove.
);
console.log('flatMap filter+map:', result); // [4, 8]

// at() — Índice negativo
const arr = [1, 2, 3, 4, 5];
console.log('at(-1):', arr.at(-1)); // 5 — último elemento
console.log('at(-2):', arr.at(-2)); // 4 — penúltimo

// find() e findIndex()
const user1 = users.find(u => u.name === 'João');
const index = users.findIndex(u => u.name === 'João');
console.log('find:', user1?.name, '| findIndex:', index);

// some() e every()
console.log('some > 3:', numbers.some(n => n > 3));  // true
console.log('every > 0:', numbers.every(n => n > 0)); // true
console.log('every > 3:', numbers.every(n => n > 3)); // false

// Rest parameters (seção 3.2 — também aqui na cheat sheet)
function sum2(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log('sum2:', sum2(1, 2, 3));       // 6
console.log('sum2:', sum2(1, 2, 3, 4, 5)); // 15

function logMessage(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}
logMessage('ERROR', 'Database', 'connection', 'failed');

// Encadeamento (chaining)
const activeAdultNames = users
  .filter(user => user.age >= 18 && user.active) // Um passe só
  .map(user => user.name);
console.log('activeAdultNames:', activeAdultNames);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 3.6 — Object.entries, fromEntries, groupBy
// ─────────────────────────────────────────────────────────────

const userObj = { name: 'Maria', age: 25, email: 'maria@example.com' };

// Object.entries() — Objeto para array de pares
const entries = Object.entries(userObj);
console.log('\nentries:', entries);
// [['name', 'Maria'], ['age', 25], ['email', 'maria@example.com']]

// Iterar sobre objeto — forma moderna
for (const [key, value] of Object.entries(userObj)) {
  process.stdout.write(`${key}: ${value}  `);
}
console.log();

// Object.fromEntries() — Array para objeto
const entArr = [['name', 'Maria'], ['age', 25]];
const userFromEntries = Object.fromEntries(entArr);
console.log('fromEntries:', userFromEntries); // { name: 'Maria', age: 25 }

// Transformar valores de objeto:
const prices     = { apple: 10, banana: 5, orange: 8 };
const discounted = Object.fromEntries(
  Object.entries(prices).map(([fruit, price]) => [fruit, price * 0.9])
);
console.log('discounted:', discounted); // { apple: 9, banana: 4.5, orange: 7.2 }

// Filtrar propriedades:
const userWithPassword = { id: 1, name: 'Maria', email: 'maria@x.com', password: 'secret' };
const safeUserFiltered = Object.fromEntries(
  Object.entries(userWithPassword).filter(([key]) => key !== 'password')
);
console.log('safeUser:', safeUserFiltered);

// Object.keys() e Object.values()
console.log('keys:  ', Object.keys(userObj));
console.log('values:', Object.values(userObj));

// Object.groupBy() — ES2024
// Polyfill para Node.js < 21:
if (!Object.groupBy) {
  Object.groupBy = function(items, keyFn) {
    return items.reduce((acc, item) => {
      const key  = keyFn(item);
      acc[key]   = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  };
}

const people = [
  { name: 'Ana', role: 'admin', age: 30 },
  { name: 'Bob', role: 'user',  age: 17 },
  { name: 'Lia', role: 'admin', age: 25 },
  { name: 'Dan', role: 'user',  age: 22 }
];

// Depois — Object.groupBy():
const grouped = Object.groupBy(people, user => user.role);
console.log('\ngroupBy role:', Object.keys(grouped), '| admins:', grouped.admin.map(u => u.name));

// Agrupar por faixa etária
const byAge = Object.groupBy(people, person =>
  person.age < 18 ? 'menor' : 'adulto'
);
console.log('groupBy age:', Object.keys(byAge));

// Agrupar por primeira letra
const names     = ['Alice', 'Bob', 'Ana', 'Carlos', 'Beatriz'];
const byLetter  = Object.groupBy(names, name => name[0]);
console.log('groupBy letter:', Object.keys(byLetter));

// Exercício 2 do capítulo — pipeline de transformação
const exUsers = [
  { name: 'Maria', age: 17, active: true,  score: 85 },
  { name: 'João',  age: 25, active: false, score: 92 },
  { name: 'Ana',   age: 30, active: true,  score: 78 },
  { name: 'Pedro', age: 22, active: true,  score: 95 }
];
const pipelineResult = exUsers
  .filter(u => u.age >= 18 && u.active)
  .sort((a, b) => b.score - a.score)
  .map(({ name, score }) => ({ name, score }));
console.log('\nExercício 2 pipeline:', pipelineResult);
// [{ name: 'Pedro', score: 95 }, { name: 'Ana', score: 78 }]
