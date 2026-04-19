# Capítulo 3 — Novas Features do ES2015–ES2025

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- Destructuring em todos os níveis: renomeação, defaults, nested, rest, parâmetros
- Spread operator e rest parameters: cópias imutáveis, merge, clone profundo
- Optional chaining (`?.`) e nullish coalescing (`??`): acesso seguro e defaults inteligentes
- Template literals: multi-line, expressões, tagged templates, SQL escaping
- Array methods: `map`, `filter`, `reduce`, `flatMap`, `at()`, `find`, `some`, `every`
- Object methods: `entries`, `fromEntries`, `keys`, `values`, `groupBy`
- Private class fields (`#`): encapsulamento real, métodos privados, státicos, getters/setters

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/destructuring.js`](exemplos/destructuring.js) | 3.1 | Básico, renomeação, defaults, nested, rest, params de função, swap, Exercício 1 |
| [`exemplos/spread-rest.js`](exemplos/spread-rest.js) | 3.2 | Spread em arrays/objetos/funções, rest params, imutabilidade, shallow vs deep copy |
| [`exemplos/optional-chaining.js`](exemplos/optional-chaining.js) | 3.3 | `?.` em objetos/métodos/arrays, `??` vs `||`, `??=`, lazy initialization |
| [`exemplos/array-methods.js`](exemplos/array-methods.js) | 3.4–3.6 | Template literals, tagged templates, `map/filter/reduce/flatMap/at()`, `Object.groupBy`, Exercício 2 |
| [`exemplos/private-class-fields.js`](exemplos/private-class-fields.js) | 3.7 + Caso Real | `#balance`, `#validateEmail`, static `#validators`, `FormValidator` completo, Exercício 3 |

---

## Pré-requisitos

- Node.js 18+ (para `structuredClone`, top-level `await` em ESM)
- Nenhuma dependência npm necessária

---

## Como executar

```bash
cd capitulo-03-es2015-2025

node exemplos/destructuring.js
node exemplos/spread-rest.js
node exemplos/optional-chaining.js
node exemplos/array-methods.js
node exemplos/private-class-fields.js
```

---

## Mapa de exemplos por seção

### 3.1 — Destructuring
```js
// Renomeação
const { name: userName, age: userAge } = user;

// Padrão + renomeação
const { timeout: requestTimeout = 3000, retries: maxRetries = 3 } = config;

// Nested
const { address: { city, street } } = user;

// Rest — remover propriedade antes de enviar
const { password, ...safeUser } = user; // nunca expõe senha

// Params de função com defaults
function createUser({ name, age = 18, role = 'user' } = {}) { }

// Swap em uma linha
[a, b] = [b, a];
```

### 3.2 — Spread / Rest
```js
const merged   = { ...defaults, ...userConfig };      // merge — último vence
const newItems = [...items, novoItem];                // imutável
const deep     = structuredClone(nested);             // clone profundo

function sum(...numbers) { return numbers.reduce((a, n) => a + n, 0); }
```

### 3.3 — Optional chaining + Nullish coalescing
```js
user?.address?.street                           // undefined se não existir
users?.[0]?.name                                // array seguro
user.getAddress?.()                             // método opcional

// ?? preserva '', 0, false — || não preserva
const name = user.name ?? 'Guest';             // '' → '' (não 'Guest')
const age  = user.age  ?? 18;                  // 0  → 0  (não 18)

config.timeout ??= 5000;                        // atribui só se null/undefined
this.#cache ??= new Map();                      // lazy initialization
```

### 3.4 — Template literals
```js
`Olá, ${name}! Você tem ${age} anos.`           // interpolação
`<div>\n  <h1>${title}</h1>\n</div>`            // multi-line

// Tagged template — SQL escaping automático
function sql(strings, ...values) { /* escapa values */ }
sql`SELECT * FROM users WHERE id = ${userId}`;  // injection-safe!

String.raw`C:\Users\nome\Documents`             // ignora \n, \t
```

### 3.5 — Array methods
```js
array.map(n => n * 2)
array.filter(n => n > 0)
array.reduce((acc, n) => acc + n, 0)
array.flatMap(user => user.hobbies)             // map + flatten
array.at(-1)                                    // último elemento
array.find(u => u.id === 2)
array.some(n => n > 3) / array.every(n => n > 0)

// Pipeline — um passe por operação
users.filter(u => u.age >= 18 && u.active).map(u => u.name)
```

### 3.6 — Object methods
```js
Object.entries(obj)                             // [['key', value], ...]
Object.fromEntries(array)                       // [['key', value]] → {}
Object.groupBy(users, u => u.role)             // ES2024 (polyfill incluído)

// Transformar valores
Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v * 0.9]))

// Filtrar propriedades
Object.fromEntries(Object.entries(user).filter(([k]) => k !== 'password'))
```

### 3.7 — Private class fields
```js
class BankAccount {
  #balance;
  constructor(balance) { this.#balance = balance; }
  getBalance() { return this.#balance; }
  // account.#balance = 999; ❌ SyntaxError — impossível
}
```

---

## Caso Real — FormValidator refatorado
→ `private-class-fields.js`

O `FormValidator` do capítulo usa todas as features de private fields:

```js
class FormValidator {
  static #EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // static privado
  static #validators  = { required, email, phone, ... }; // mapa de validators
  #rules;
  #errors = new Map();
  #messages;

  async #validateField(field, value, rules) { ... } // método privado
  async validate(data) {
    await Promise.all(Object.entries(this.#rules).map(...)); // paralelo
    return this.#errors.size === 0;
  }
  static addValidator(name, fn) { FormValidator.#validators[name] = fn; }
}
```

**Métricas:** 120 → 95 linhas (-20%), 8 propriedades públicas → 0, validação assíncrona habilitada, tempo médio 15ms → 8ms (-47%).

---

## Exercícios (do livro)

**Exercício 1** → `destructuring.js`: Refatore `createUser` usando destructuring, defaults e `??`.

**Exercício 2** → `array-methods.js`: Pipeline — adultos ativos, ordenados por score, apenas `{name, score}`.

**Exercício 3** → `private-class-fields.js`: `ShoppingCart` com `#items`, `#calculateTotal()` e encapsulamento garantido.

---

## Cheat sheet rápido (do livro)

```js
// Destructuring
const { name, age = 18 }          = user;
const { address: { city } }       = user;
const [first, ...rest]             = array;

// Spread / Rest
const copy   = { ...obj };
const merged = { ...defaults, ...config };
function fn(...args) { }

// Optional chaining
user?.address?.street
func?.()
array?.[0]

// Nullish coalescing
const value = input ?? defaultValue;
config.timeout ??= 5000;

// Array methods
array.map(x => x * 2)
array.filter(x => x > 0)
array.reduce((acc, x) => acc + x, 0)
array.flatMap(x => [x, x * 2])
array.at(-1)

// Object methods
Object.entries(obj)
Object.fromEntries(array)
Object.groupBy(array, item => item.category)

// Private fields
class Foo {
  #private;
  #method() { }
  static #static;
}
```

---

## Recursos

- [MDN — Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN — Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN — Private Fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
