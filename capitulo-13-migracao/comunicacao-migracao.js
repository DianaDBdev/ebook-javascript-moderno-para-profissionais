// comunicacao-migracao.js — Seção 13.5: Comunicando mudanças + Caso Real
// Capítulo 13 — Migrando Projetos Legados
//
// Execute: node exemplos/comunicacao-migracao.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.5 — Por que comunicação é crítica
// ─────────────────────────────────────────────────────────────

console.log('=== Por que comunicação falha em migrações ===\n');

const razoesFalha = [
  'Desenvolvedores continuam usando padrão antigo por inércia ou desconhecimento',
  'Time não entende o porquê — segue novas regras sem convicção',
  'Resistência passiva: "funciona assim há anos, por que mudar?"',
  'Falta de alinhamento — metade usa padrão novo, metade usa antigo',
  'Gestão não vê valor — pressão por features derruba a migração',
];
razoesFalha.forEach(r => console.log(`  • ${r}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.5 — Guia de migração interno
// ─────────────────────────────────────────────────────────────

console.log('\n=== Guia de migração — estrutura recomendada ===\n');

// docs/guides/using-vitest.md
const guiaVitest = `
# docs/guides/using-vitest.md

## Por que mudamos de Jest para Vitest
Vitest tem integração nativa com Vite (já usamos), suporte ESM sem
config extra e é 3–5× mais rápido no modo watch. A API é idêntica.

## A partir de agora: use Vitest
\`\`\`ts
import { describe, it, expect, vi } from 'vitest'; // ← import explícito

describe('meu módulo', () => {
  it('faz o que deveria', () => { expect(1 + 1).toBe(2); });
});
\`\`\`

## Não use mais: Jest
\`\`\`ts
// ❌ Não crie novos arquivos de teste com Jest
import { describe, it, expect } from '@jest/globals';
\`\`\`

## Migrando um arquivo existente
1. Substitua jest. por vi. nos mocks
2. Adicione imports explícitos de vitest
3. Delete jest.config.js quando todos os arquivos estiverem migrados

## Dúvidas: #canal-tech-migration
`.trim();

guiaVitest.split('\n').slice(0, 15).forEach(l => console.log(`  ${l}`));
console.log('  ...');

// Um guia deve responder:
console.log('\nUm guia interno deve responder:');
['O que mudou e por quê — contexto sem julgamento do código antigo',
 'O que fazer a partir de agora — padrão novo com exemplos',
 'O que não fazer mais — padrão antigo marcado claramente',
 'Como migrar código existente — passo a passo',
 'Quem perguntar em caso de dúvida',
].forEach((q, i) => console.log(`  ${i+1}. ${q}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 13.5 — ESLint para bloquear padrão antigo no CI
// ─────────────────────────────────────────────────────────────

console.log('\n=== ESLint — bloquear require() em novos arquivos ===\n');

const eslintConfig = `
// eslint.config.js
export default [
  {
    files: ['src/**/*.ts'],  // Novos arquivos
    rules: {
      '@typescript-eslint/no-var-requires': 'error', // Bloqueia require()
      'no-restricted-syntax': ['error', {
        selector: 'CallExpression[callee.name="require"]',
        message:  'Use ESM imports. Veja docs/guides/using-esm.md',
      }],
    }
  },
  {
    files: ['src/legacy/**'],  // Legado ainda permitido
    rules: { '@typescript-eslint/no-var-requires': 'off' }
  }
];
`.trim();

eslintConfig.split('\n').forEach(l => console.log(`  ${l}`));
console.log('\n💡 CI bloqueia padrão antigo em novos arquivos — mantém progresso da migração.');

// ─────────────────────────────────────────────────────────────
// CASO REAL — 18 meses, 60k linhas, CommonJS → TypeScript + ESM
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: API Express, 60k linhas, 18 meses ===\n');

const diagnostico = {
  linguagem:      'JavaScript (CommonJS)',
  typescript:     '0%',
  coberturaTestes: '11%',
  bugsProducao:   '5 por semana',
  onboarding:     '2 semanas',
  linhasCodigo:   '60 mil em 140 arquivos',
  scoreTotal:     '25/30 — migração urgente',
};

console.log('Diagnóstico inicial:');
Object.entries(diagnostico).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(20)}: ${v}`);
});

// Roadmap de 18 meses:
console.log('\nRoadmap de 18 meses:');
const roadmap = [
  { trim: 'T1 — Fundação',         itens: ['TypeScript strict:false + allowJs:true', 'Characterization tests módulos críticos', 'Tipos centrais em src/types/'] },
  { trim: 'T2 — Infraestrutura',   itens: ['Logger Pino', 'Config/env com Zod', 'Utilitários e validators → .ts'] },
  { trim: 'T3 — Núcleo negócio',   itens: ['Serviços de usuário e auth', 'Serviços de produto e pedido', 'Coverage 11% → 55%'] },
  { trim: 'T4 — Camada HTTP',      itens: ['Controllers TypedRequest/TypedResponse', 'Middleware auth', 'Migração para ESM'] },
  { trim: 'T5 — Finalização',      itens: ['strict:true — corrigir 2.847 erros', 'Remover legado', 'Coverage → 78%'] },
  { trim: 'T6 — Consolidação',     itens: ['CI bloqueia padrão antigo', 'ADRs documentados', 'Guias de estilo atualizados'] },
];

roadmap.forEach(({ trim, itens }) => {
  console.log(`  ${trim}:`);
  itens.forEach(i => console.log(`    → ${i}`));
});

// Lições do caso real:
console.log('\nLições mais valiosas:');
const licoes = [
  'Characterization tests são inegociáveis — escreva ANTES de qualquer mudança',
  'strict: true no INÍCIO, não no final — distribui o custo de forma gerenciável',
  'Feature flags para módulos críticos — rollback sem deploy salva noites de sono',
  'ADRs valem o tempo de escrever — 14 ADRs economizaram horas de discussão',
  'A resistência humana é real — aborde com empatia e dados, não com imposição',
  'Meça e torne visível — progresso visível mantém motivação e apoio da gestão',
];
licoes.forEach(l => console.log(`  ✓ ${l}`));

// Resultados:
console.log('\nResultados após 18 meses:');
const resultados = [
  { metrica: 'Coverage de testes',       antes: '11%',     depois: '78%'    },
  { metrica: 'Bugs de produção/semana',  antes: '5',       depois: '0,4'    },
  { metrica: 'Tempo de onboarding',      antes: '2 semanas', depois: '3 dias' },
  { metrica: 'Feature média',            antes: '2 semanas', depois: '4 dias' },
  { metrica: 'Bundle size',              antes: 'baseline', depois: '-35%'   },
  { metrica: 'Satisfação do time',       antes: '5,1/10',  depois: '8,6/10' },
];
resultados.forEach(({ metrica, antes, depois }) => {
  console.log(`  ${metrica.padEnd(30)}: ${antes.padEnd(12)} → ${depois}`);
});

// Surpresa desagradável: strict: true revelou 2.847 erros
console.log('\n⚠️  Surpresa: ativar strict:true no T5 revelou 2.847 erros TypeScript.');
console.log('   Levamos 6 semanas a mais do que o planejado para resolver.');
console.log('   Lição: active strict:true no INÍCIO — melhor descobrir distribuídos do que todos de uma vez.');

// Resistência humana:
console.log('\n👥 Resistência de 2 devs seniores:');
console.log('   Resolveu-se com conversa honesta sobre o impacto no trabalho DELES:');
console.log('   bugs que precisavam resolver toda semana, dificuldade para onboarding de juniores.');

// Migrações falham por razões técnicas e por razões humanas.
// As razões humanas são mais comuns.
// useNewPaymentService: feature flag para rollout gradual do módulo de pagamento
