// private-class-fields.js — Seção 3.7: Private class fields e métodos
// Capítulo 3 — Novas Features do ES2015–ES2025
// Inclui também: Caso Real — FormValidator refatorado
//
// Execute: node exemplos/private-class-fields.js

// ─────────────────────────────────────────────────────────────
// 1. Campos públicos vs privados — encapsulamento real
// ─────────────────────────────────────────────────────────────

// ❌ Antes: 'privado' por convenção — qualquer um pode acessar
class BankAccountOld {
  constructor(balance) { this._balance = balance; }
  getBalance() { return this._balance; }
}
const accountOld = new BankAccountOld(1000);
accountOld._balance = 999999; // Nada impede isso!
console.log('Old account (hackeado):', accountOld.getBalance()); // 999999

// ✅ Depois: verdadeiramente privado
class BankAccount {
  #balance;
  constructor(balance) { this.#balance = balance; }
  getBalance()  { return this.#balance; }
  deposit(amt)  { this.#balance += amt; return this; }
  withdraw(amt) {
    if (amt > this.#balance) throw new Error('Saldo insuficiente');
    this.#balance -= amt;
    return this;
  }
}
const account = new BankAccount(1000);
// account.#balance = 999999; // ❌ SyntaxError — campo '#balance' é privado
account.deposit(500).withdraw(200);
console.log('BankAccount balance:', account.getBalance()); // 1300

// ─────────────────────────────────────────────────────────────
// 2. Métodos privados
// ─────────────────────────────────────────────────────────────

class UserValidator {
  #validateEmail(email)   { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  #validatePassword(pass) { return pass.length >= 8; }

  // Método público que usa métodos privados
  validate(user) {
    return this.#validateEmail(user.email) &&
           this.#validatePassword(user.password);
  }
}
const validator = new UserValidator();
// validator.#validateEmail('test'); // ❌ SyntaxError
console.log('validate ok:', validator.validate({ email: 'a@b.com', password: '12345678' }));
console.log('validate bad:', validator.validate({ email: 'inválido', password: '123' }));

// ─────────────────────────────────────────────────────────────
// 3. Campos privados estáticos — Singleton pattern
// ─────────────────────────────────────────────────────────────

class Config {
  static #instance;
  static #initialized = false;

  static getInstance() {
    if (!this.#initialized) {
      this.#instance    = new Config();
      this.#initialized = true;
    }
    return this.#instance;
  }
}
console.log('Singleton:', Config.getInstance() === Config.getInstance()); // true

// ─────────────────────────────────────────────────────────────
// 4. Getters e setters com campos privados
// ─────────────────────────────────────────────────────────────

class Temperature {
  #celsius;
  constructor(celsius) { this.#celsius = celsius; }
  get #fahrenheit()  { return this.#celsius * 9/5 + 32; }
  set #fahrenheit(f) { this.#celsius = (f - 32) * 5/9; }
  display() { return `${this.#celsius}°C = ${this.#fahrenheit}°F`; }
}
console.log('Temperature:', new Temperature(100).display()); // 100°C = 212°F

// Validação com setters:
class User {
  #email;
  set email(value) {
    if (!value.includes('@')) throw new Error('Email inválido');
    this.#email = value;
  }
  get email() { return this.#email; }
}
const u = new User();
try {
  u.email = 'invalid'; // ❌ Error
} catch (e) {
  console.log('Email inválido:', e.message);
}
u.email = 'valid@example.com'; // ✅
console.log('Email válido:', u.email);

// ─────────────────────────────────────────────────────────────
// 5. Lazy initialization com ??= (seção 3.3)
// ─────────────────────────────────────────────────────────────

class UserService {
  #cache;
  getCache() {
    this.#cache ??= new Map(); // Cria apenas na primeira chamada
    return this.#cache;
  }
}
const svc = new UserService();
svc.getCache().set('user:1', { name: 'Diana' });
console.log('Cache mesma instância:', svc.getCache() === svc.getCache()); // true
console.log('Cache valor:', svc.getCache().get('user:1'));

// ─────────────────────────────────────────────────────────────
// CASO REAL — Seção 3.7: FormValidator refatorado
// ─────────────────────────────────────────────────────────────

class FormValidator {
  // Regex estáticos — compartilhados, não recriados a cada instância
  static #EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static #PHONE_REGEX = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;

  static #validators = {
    required:  (value)      => value !== null && value !== undefined && value !== '',
    email:     (value)      => FormValidator.#EMAIL_REGEX.test(value),
    phone:     (value)      => FormValidator.#PHONE_REGEX.test(value),
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max,
    pattern:   (value, rx)  => new RegExp(rx).test(value),
    custom:    async (value, fn) => await fn(value)
  };

  #rules;
  #errors = new Map();
  #messages;

  constructor(rules, customMessages = {}) {
    this.#rules    = rules;
    this.#messages = {
      required:  (f)    => `${f} é obrigatório`,
      email:     (f)    => `${f} deve ser um email válido`,
      minLength: (f, n) => `${f} deve ter no mínimo ${n} caracteres`,
      custom:    (f)    => `${f} é inválido`,
      ...customMessages
    };
  }

  #addError(field, rule, ...args) {
    if (!this.#errors.has(field)) this.#errors.set(field, []);
    const msg = typeof this.#messages[rule] === 'function'
      ? this.#messages[rule](field, ...args)
      : this.#messages[rule];
    this.#errors.get(field).push(msg);
  }

  async #validateField(field, value, rules) {
    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      const validatorFn = FormValidator.#validators[ruleName];
      if (!validatorFn) { console.warn(`Validator '${ruleName}' não encontrado`); continue; }
      // Pula validações se campo opcional estiver vazio
      if (ruleName !== 'required' && !FormValidator.#validators.required(value)) continue;
      const isValid = ruleName === 'custom'
        ? await validatorFn(value, ruleValue)
        : typeof ruleValue === 'boolean' ? validatorFn(value) : validatorFn(value, ruleValue);
      if (!isValid) this.#addError(field, ruleName, ruleValue);
    }
  }

  async validate(data) {
    this.#errors.clear();
    await Promise.all(
      Object.entries(this.#rules).map(([field, rules]) =>
        this.#validateField(field, data[field], rules)
      )
    );
    return this.#errors.size === 0;
  }

  getErrors()           { return Object.fromEntries(this.#errors); }
  hasErrors()           { return this.#errors.size > 0; }
  getFieldErrors(field) { return this.#errors.get(field) || []; }

  static addValidator(name, fn) { FormValidator.#validators[name] = fn; }
}

// Uso moderno
const fv = new FormValidator({
  email:    { required: true, email: true },
  password: {
    required: true, minLength: 8,
    custom: async (value) => value !== '12345678' // Senha muito comum
  }
}, {
  required: (f) => `Por favor, preencha ${f}`,
  custom:   ()  => 'Senha muito comum. Escolha outra.'
});

// Adicionar validador customizado global
FormValidator.addValidator('cpf', (value) => /^\d{11}$/.test(value.replace(/\D/g, '')));

console.log('\n=== FormValidator ===');
const isValid = await fv.validate({ email: 'a@b.com', password: '12345678' });
console.log('válido:', isValid);            // false (senha comum)
console.log('erros: ', fv.getErrors());

const isValid2 = await fv.validate({ email: 'a@b.com', password: 'MinhaS3nh@Segura' });
console.log('válido2:', isValid2);          // true
console.log('hasErrors:', fv.hasErrors());  // false

// Exercício 3 do capítulo — ShoppingCart com private fields
class ShoppingCart {
  #items = [];

  addItem(item)    { this.#items.push(item); return this; }
  removeItem(id)   { this.#items = this.#items.filter(i => i.id !== id); return this; }
  #calculateTotal(){ return this.#items.reduce((sum, item) => sum + item.price, 0); }
  getTotal()       { return this.#calculateTotal(); }
  getItemCount()   { return this.#items.length; }
}

const cart = new ShoppingCart();
cart.addItem({ id: 1, name: 'Livro', price: 49.90 })
    .addItem({ id: 2, name: 'Caneta', price: 5.50 });
console.log('\nShoppingCart total:', cart.getTotal());       // 55.40
console.log('ShoppingCart count:', cart.getItemCount());    // 2
cart.removeItem(1);
console.log('Após remove total:', cart.getTotal());         // 5.50
// cart.#items; // ❌ SyntaxError — encapsulamento garantido
