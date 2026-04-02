// array-methods.js — map, filter, reduce, flatMap, at(), groupBy
// Execute: node 04-array-methods/array-methods.js

const produtos = [
  { id: 1, nome: 'Notebook',  preco: 3500, categoria: 'tech',  ativo: true  },
  { id: 2, nome: 'Mouse',     preco: 120,  categoria: 'tech',  ativo: true  },
  { id: 3, nome: 'Cadeira',   preco: 890,  categoria: 'móveis',ativo: false },
  { id: 4, nome: 'Monitor',   preco: 1200, categoria: 'tech',  ativo: true  },
  { id: 5, nome: 'Escrivaninha', preco: 650, categoria: 'móveis', ativo: true },
];

// ──────────────────────────────────────────────
// map — transforma cada item
// ──────────────────────────────────────────────
const nomes = produtos.map(p => p.nome);
console.log('Nomes:', nomes);

const comDesconto = produtos.map(p => ({ ...p, preco: p.preco * 0.9 }));
console.log('Com 10% desconto:', comDesconto.map(p => `${p.nome}: R$${p.preco.toFixed(2)}`));

// ──────────────────────────────────────────────
// filter — filtra por condição
// ──────────────────────────────────────────────
const tech = produtos.filter(p => p.categoria === 'tech' && p.ativo);
console.log('Tech ativos:', tech.map(p => p.nome));

// ──────────────────────────────────────────────
// reduce — acumula um resultado
// ──────────────────────────────────────────────
const totalAtivos = produtos
  .filter(p => p.ativo)
  .reduce((acc, p) => acc + p.preco, 0);
console.log('Total (ativos):', totalAtivos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

// ──────────────────────────────────────────────
// flatMap — map + flatten em uma operação
// ──────────────────────────────────────────────
const tags = [
  { nome: 'Notebook', tags: ['tech', 'premium', 'trabalho'] },
  { nome: 'Mouse',    tags: ['tech', 'periférico'] },
];
const todasTags = tags.flatMap(p => p.tags);
console.log('Todas as tags:', [...new Set(todasTags)]); // sem duplicatas

// ──────────────────────────────────────────────
// at() — índice negativo para acessar do final
// ──────────────────────────────────────────────
const numeros = [10, 20, 30, 40, 50];
console.log(numeros.at(0));   // 10 (primeiro)
console.log(numeros.at(-1));  // 50 (último) — sem arr[arr.length - 1]
console.log(numeros.at(-2));  // 40 (penúltimo)

// ──────────────────────────────────────────────
// Object.groupBy (ES2024) — agrupa por critério
// ──────────────────────────────────────────────
const porCategoria = Object.groupBy(produtos, p => p.categoria);
console.log('Por categoria:', Object.keys(porCategoria));
// { tech: [...], móveis: [...] }
