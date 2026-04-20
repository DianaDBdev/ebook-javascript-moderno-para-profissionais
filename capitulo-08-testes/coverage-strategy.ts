// coverage-strategy.ts — Seção 8.5: Coverage que importa + Pirâmide de testes
// Capítulo 8 — Testing no Mundo Moderno
//
// Execute: npx tsx exemplos/coverage-strategy.ts

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — O problema com a obsessão por 100%
// ─────────────────────────────────────────────────────────────

console.log('=== Coverage que importa ===\n');

// ❌ Teste que existe só para cobrir a linha
// it('cria instância da classe', () => {
//   const service = new UserService(mockRepo, mockEmail, mockLogger);
//   expect(service).toBeDefined(); // Não testa nada útil
// });
// Coverage: 100% — Confiança real: 0%

// 💡 Coverage mede linhas executadas, não comportamentos verificados.
//    Um teste pode executar 100% do código sem fazer assertions úteis.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — Metas de coverage por camada
// ─────────────────────────────────────────────────────────────

const metasPorCamada = [
  { camada: 'Lógica de negócio (entidades, use cases)', meta: '90–100%', motivo: 'Bugs custam mais aqui' },
  { camada: 'Serviços e utilitários',                   meta: '80–90%',  motivo: 'Alto impacto' },
  { camada: 'Componentes UI',                           meta: '70–80%',  motivo: 'Foque nos fluxos críticos' },
  { camada: 'Configurações e boilerplate',              meta: 'excluir', motivo: 'Sem lógica relevante' },
  { camada: 'Arquivos index.ts (barrels)',               meta: 'excluir', motivo: 'Sem lógica' },
];

console.log('Metas de coverage por camada:');
metasPorCamada.forEach(({ camada, meta, motivo }) => {
  console.log(`  ${meta.padEnd(10)} ${camada.padEnd(40)} ← ${motivo}`);
});

console.log('\nMetas gerais por maturidade do projeto:');
console.log('  Projetos novos:  comece com 70%, suba gradualmente');
console.log('  Projetos legados: 50% já é significativo; avance 5% por sprint');
console.log('  Nunca defina 100% como meta geral — você vai criar testes ruins');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — O que coverage NÃO mede
// ─────────────────────────────────────────────────────────────

console.log('\n=== O que coverage NÃO mede ===\n');

const naomede = [
  'Qualidade das assertions — um teste pode ter expect(true).toBe(true)',
  'Casos de borda — null, undefined, arrays vazios, strings enormes',
  'Integração entre módulos — 100% individual pode quebrar na integração',
  'Comportamento real do usuário — E2E é indispensável para isso',
];
naomede.forEach(n => console.log(`  ✗ ${n}`));

const importaMais = [
  'Mutation testing — verifica se seus testes detectam bugs introduzidos',
  'Testes de contrato — garantem que a API não quebra consumidores',
  'Testes de regressão — cada bug corrigido vira um teste',
  'Revisão de casos de borda — zero, negativo, null, máximo',
];
console.log('\nO que importa MAIS que coverage:');
importaMais.forEach(i => console.log(`  ✓ ${i}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — Mutation testing com Stryker
// ─────────────────────────────────────────────────────────────

console.log('\n=== Mutation testing com Stryker ===\n');

// npm install -D @stryker-mutator/core @stryker-mutator/vitest-runner

const strykerConfig = `
// stryker.config.mjs
export default {
  testRunner:     'vitest',
  reporters:      ['html', 'clear-text'],
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/test/',
  ],
};

// npx stryker run
`;
console.log(strykerConfig.trim());

const mutationScores = [
  { score: '80%+',    avaliacao: 'Testes de alta qualidade' },
  { score: '60–80%',  avaliacao: 'Aceitável, melhorar gradualmente' },
  { score: '< 60%',   avaliacao: 'Testes existem mas não detectam bugs' },
];

console.log('Interpretando o mutation score:');
mutationScores.forEach(({ score, avaliacao }) => {
  console.log(`  ${score.padEnd(10)}: ${avaliacao}`);
});

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — Pirâmide de testes moderna
// ─────────────────────────────────────────────────────────────

console.log('\n=== Pirâmide de testes moderna para JavaScript ===\n');

const piramide = [
  { tipo: 'E2E (topo)',            proporcao: '5–10 testes', descricao: 'Apenas fluxos críticos de negócio' },
  { tipo: 'Integração (meio)',     proporcao: '40–50%',      descricao: 'Componentes + dados reais, serviços com banco em memória' },
  { tipo: 'Unitários (base)',      proporcao: '40–50%',      descricao: 'Lógica de negócio pura, utilitários, entidades' },
];

piramide.forEach(({ tipo, proporcao, descricao }) => {
  console.log(`  ${tipo.padEnd(22)}: ${proporcao.padEnd(12)} → ${descricao}`);
});

console.log('\n💡 A proporção exata não é sagrada.');
console.log('   O objetivo é confiança suficiente para fazer deploy sem medo.');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.5 — O que testar (guia prático)
// ─────────────────────────────────────────────────────────────

console.log('\n=== O que testar — guia prático ===\n');

const testarSempre = [
  'Lógica de negócio com condicionais — cada branch do if/else',
  'Cálculos financeiros — zero margem para erro',
  'Validações — especialmente os casos de borda',
  'Comportamentos esperados por usuários reais (com Testing Library)',
  'Casos de erro — API falha, dados inválidos',
];

const geralmenteNao = [
  'Getters e setters triviais sem lógica',
  'Configurações de terceiros (tsconfig, eslint config)',
  'Arquivos de tipos TypeScript — o compilador já valida',
  'Dependências externas — confie nos testes deles',
];

console.log('✅ Teste SEMPRE:');
testarSempre.forEach(t => console.log(`   • ${t}`));
console.log('\n⚠️  Geralmente NÃO vale testar:');
geralmenteNao.forEach(t => console.log(`   • ${t}`));

// ─────────────────────────────────────────────────────────────
// CASO REAL — Resultados (Seção 8.5)
// ─────────────────────────────────────────────────────────────

console.log('\n=== Caso Real: plataforma SaaS, 6 semanas, de 0% para 68% ===\n');

const resultados = [
  { metrica: 'Coverage backend',            antes: '0%',   depois: '68%'   },
  { metrica: 'Coverage frontend',           antes: '0%',   depois: '54%'   },
  { metrica: 'Bugs de regressão/semana',    antes: '2–3',  depois: '0,3'   },
  { metrica: 'Tempo de QA manual/deploy',   antes: '3h',   depois: '30min' },
  { metrica: 'Bugs detectados antes da prod', antes: '0', depois: '11 (3 críticos)' },
];

resultados.forEach(({ metrica, antes, depois }) => {
  console.log(`  ${metrica.padEnd(38)}: ${antes.padEnd(5)} → ${depois}`);
});

console.log('\nDistribuição da suite final:');
console.log('  47 testes unitários  (lógica financeira, validadores, utilitários)');
console.log('  83 testes integração (componentes + hooks + services)');
console.log('  12 testes E2E        (login, pagamento, relatórios)');

// Notas adicionais:
// Caso Real — encontramos 3 bugs nessa primeira semana (seção 8.5)
// Coverage backend foi de 0% para 68%, frontend de 0% para 54%
