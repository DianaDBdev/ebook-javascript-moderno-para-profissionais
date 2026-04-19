// default-export.js — Seção 1.3: Default exports vs Named exports
// Capítulo 1 — ESM: O Novo Padrão
//
// Execute: node exemplos/default-export.js

// ─────────────────────────────────────────────────────────────
// 1. Default export — uma coisa principal por arquivo
//    (representa: User.js)
// ─────────────────────────────────────────────────────────────

export default class User {
  constructor(name, email) {
    this.name  = name;
    this.email = email;
  }

  getDisplayName() {
    return this.name;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}

// Importação — sem chaves, qualquer nome local funciona:
//   import User   from './User.js';    // convenção: mesmo nome do arquivo
//   import MyUser from './User.js';    // também válido, mas evite

// Quando usar default export?
//   • Componentes React/Vue (convenção forte da comunidade)
//   • Uma classe que representa o arquivo inteiro
//   • Uma configuração única ou instância única

// ─────────────────────────────────────────────────────────────
// 2. O problema dos default exports: nomes inconsistentes
// ─────────────────────────────────────────────────────────────

//   import UserService from './UserService.js'; // Arquivo 1
//   import UserManager from './UserService.js'; // Arquivo 2 — nome diferente!
//   import US          from './UserService.js'; // Arquivo 3 — o que é US?
//
// Com named exports, todos os arquivos usam o mesmo nome,
// e IDEs identificam todos os usos automaticamente.

// Regra prática:
//   • Default export → componentes React/Vue, classes que representam o arquivo inteiro
//   • Named exports  → todo o resto (utilitários, helpers, constantes, múltiplas coisas)

// ─────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────
const user = new User('Diana', 'diana@db.dev');
console.log('getDisplayName():', user.getDisplayName());
console.log('toString()      :', user.toString());
