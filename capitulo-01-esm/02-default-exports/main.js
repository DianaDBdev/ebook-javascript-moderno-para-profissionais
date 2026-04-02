// main.js — Importando default export
// Sem chaves {}. Pode usar qualquer nome local (mas use o nome do arquivo por convenção).

import User from './User.js';

const user = new User('Diana', 'diana@example.com');
console.log(user.getDisplayName()); // Diana
console.log(user.toString());       // Diana <diana@example.com>
