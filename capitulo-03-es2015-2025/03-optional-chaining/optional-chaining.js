// optional-chaining.js — ?. e ?? na prática
// Execute: node 03-optional-chaining/optional-chaining.js

// ──────────────────────────────────────────────
// Optional chaining (?.)
// ──────────────────────────────────────────────
const usuario = {
  nome: 'Diana',
  endereco: {
    cidade: 'Belém',
    bairro: null,
  },
  // pagamento não existe
};

// ❌ Sem optional chaining — TypeError se propriedade não existir
// console.log(usuario.pagamento.cartao.numero); // CRASH

// ✅ Com optional chaining — retorna undefined sem quebrar
console.log(usuario.endereco?.cidade);           // 'Belém'
console.log(usuario.endereco?.cep);              // undefined
console.log(usuario.pagamento?.cartao?.numero);  // undefined (sem crash)
console.log(usuario.endereco?.bairro?.trim());   // undefined (bairro é null)

// ──────────────────────────────────────────────
// Nullish coalescing (??)
// ──────────────────────────────────────────────
// ?? — retorna o lado direito apenas quando o esquerdo é null ou undefined
// || — retorna o lado direito para qualquer valor falsy (0, '', false)

const config = { timeout: 0, nome: '', ativo: false };

// ❌ Problema com || — sobrescreve valores válidos como 0 e ''
console.log(config.timeout || 5000);  // 5000 ← ERRADO: 0 é válido!
console.log(config.nome    || 'anon');// 'anon' ← ERRADO: '' pode ser intencional

// ✅ ?? respeita 0, false e ''
console.log(config.timeout ?? 5000);  // 0     ← CORRETO
console.log(config.nome    ?? 'anon');// ''    ← CORRETO
console.log(config.ativo   ?? true);  // false ← CORRETO
console.log(config.limite  ?? 100);   // 100   ← usa padrão pois é undefined

// ──────────────────────────────────────────────
// Combinando ?. com ??
// ──────────────────────────────────────────────
const cidade = usuario.endereco?.cidade ?? 'Cidade não informada';
console.log(cidade); // 'Belém'

const cep = usuario.endereco?.cep ?? 'CEP não cadastrado';
console.log(cep);    // 'CEP não cadastrado'

// ──────────────────────────────────────────────
// Optional chaining em métodos e arrays
// ──────────────────────────────────────────────
const obj = { saudar: () => 'Olá!' };
console.log(obj.saudar?.());     // 'Olá!'
console.log(obj.despedir?.());   // undefined (sem crash)

const arr = [1, 2, 3];
console.log(arr?.[0]);           // 1
console.log(null?.[0]);          // undefined
