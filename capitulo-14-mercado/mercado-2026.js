// mercado-2026.js — Seções 14.1 e 14.4: Mercado, salários, certificações
// Capítulo 14 — Skills para o Mercado Atual
//
// Execute: node exemplos/mercado-2026.js

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.1 — O que mudou nas contratações
// ─────────────────────────────────────────────────────────────

console.log('=== O que mudou nas contratações (2026) ===\n');

const mudancas = [
  '"Sabe React?" → substituído por "Sabe construir produtos escaláveis com React?"',
  'Anos de experiência importam menos — profundidade de entendimento importa mais',
  'TypeScript passou de diferencial para pré-requisito em 80% das vagas front/back',
  'Testes automatizados: de "nice to have" para requisito em empresas de qualidade',
  'Capacidade de comunicar decisões técnicas vale tanto quanto a decisão em si',
];
mudancas.forEach(m => console.log(`  • ${m}`));

// O que empresas de alto nível avaliam (Nubank, Mercado Livre, Shopify, Stripe):
console.log('\nO que empresas de alto nível avaliam:\n');

const avaliacoes = {
  'Profundidade vs superficialidade': [
    'Candidatos que dominam 5 tecnologias profundamente > 20 tecnologias superficialmente',
    '"Você usa TypeScript" vs "Você entende como o sistema de tipos resolve problemas reais"',
    '"Você escreve testes" vs "Você sabe o que testar e por quê"',
  ],
  'Raciocínio sobre trade-offs': [
    '"Quando usar GraphQL em vez de REST?" — não há resposta certa, mas há raciocínio certo',
    '"Como decidir entre SSR e SSG?" — o processo de decisão importa',
    '"Qual o custo de adicionar TypeScript a um legado?" — honestidade técnica',
  ],
  'Comunicação e colaboração': [
    'Explicar decisões técnicas para não-técnicos',
    'Experiência em code reviews construtivos',
    'Histórico de documentação e ADRs',
  ],
};

for (const [cat, itens] of Object.entries(avaliacoes)) {
  console.log(`  ${cat}:`);
  itens.forEach(i => console.log(`    • ${i}`));
  console.log();
}

console.log('💡 A entrevista mais difícil não pergunta "o que é closure?"');
console.log('   Ela pergunta "me conta sobre uma decisão técnica difícil que você tomou".\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.1 — Salários e diferença real do stack moderno
// ─────────────────────────────────────────────────────────────

console.log('=== Salários — stack moderno vs sem TypeScript (Brasil 2026) ===');
console.log('(Fontes: Glassdoor, LinkedIn Salary, surveys da comunidade — consulte fontes atualizadas ao aplicar)\n');

const salarios = {
  'JS sem TypeScript': {
    Junior: 'R$ 3.000–5.000',
    Pleno:  'R$ 6.000–9.000',
    Senior: 'R$ 10.000–15.000',
  },
  'TypeScript + stack moderno (Vite, testes, CI/CD)': {
    Junior: 'R$ 4.500–7.000  (+40–50%)',
    Pleno:  'R$ 9.000–14.000  (+50–55%)',
    Senior: 'R$ 15.000–25.000+  (+50–67%)',
  },
  'Internacional remoto (USD/EUR)': {
    Junior: '—',
    Pleno:  'US$ 3.000–6.000/mês',
    Senior: 'US$ 6.000–12.000/mês',
  },
};

for (const [stack, niveis] of Object.entries(salarios)) {
  console.log(`  ${stack}:`);
  for (const [nivel, val] of Object.entries(niveis)) {
    console.log(`    ${nivel.padEnd(8)}: ${val}`);
  }
  console.log();
}
console.log('⚠️  Valores variam por empresa, localização e momento do mercado.');
console.log('   Use como referência — negocie sempre com dados atualizados.\n');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.1 — O que está crescendo e o que está morrendo
// ─────────────────────────────────────────────────────────────

console.log('=== Tendências 2026 ===\n');

const crescendo = [
  'TypeScript — adoção consolidada como pré-requisito padrão',
  'Next.js App Router / React Server Components — nova fronteira do SSR',
  'Vitest — substituindo Jest em projetos novos com Vite',
  'tRPC — ganhando tração em monorepos TypeScript',
  'Edge computing — Vercel Edge, Cloudflare Workers',
  'AI-assisted development — Cursor, GitHub Copilot, Claude Code (ver seção 14.6)',
];

const declinando = [
  'jQuery — ainda em 77% da web, mas zero demanda em vagas novas',
  'Webpack — sendo substituído por Vite na maioria dos projetos novos',
  'JavaScript sem TypeScript — ainda existe, mas cada vez mais nicho',
  'Class-based React — Hooks são o padrão desde 2019',
  'REST sem tipos — tRPC e GraphQL com codegen estão avançando',
];

console.log('Crescendo rapidamente:');
crescendo.forEach(t => console.log(`  ✅ ${t}`));
console.log('\nEm declínio ou estagnado:');
declinando.forEach(t => console.log(`  📉 ${t}`));

// ─────────────────────────────────────────────────────────────
// SEÇÃO 14.4 — Certificações que valem a pena
// ─────────────────────────────────────────────────────────────

console.log('\n=== Certificações — o que realmente importa ===\n');

// O que empresas técnicas valorizam — em ordem:
const valorOrdem = [
  'Código em produção que você pode mostrar e explicar',
  'Contribuições para open source com repercussão',
  'Histórico verificável de decisões técnicas boas',
  'Recomendações de pessoas que trabalharam com você',
  'Certificações (bem abaixo na lista para a maioria das vagas)',
];
console.log('O que empresas técnicas valorizam (em ordem):');
valorOrdem.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));

const certs = [
  { nome: 'AWS Certified Developer / Solutions Architect', valor: 'Alto', nota: 'Amplamente valorizada em vagas full-stack com infra. Associate: 40–60h, Professional: 80–120h' },
  { nome: 'Google Cloud Professional Developer',            valor: 'Médio', nota: 'Menor demanda no Brasil — considerável se empresa-alvo usa GCP' },
  { nome: 'Meta Front-End Developer (Coursera)',            valor: 'Baixo/médio', nota: 'Útil para primeiro emprego; para devs experientes o portfólio pesa mais' },
];

console.log('\nCertificações com valor real:');
certs.forEach(({ nome, valor, nota }) => {
  console.log(`  ${nome}`);
  console.log(`    Valor: ${valor} | ${nota}`);
  console.log();
});

// Cursos que substituem certificações:
const cursos = [
  { nome: 'Total TypeScript (Matt Pocock)',       url: 'totaltypescript.com',   desc: 'O melhor recurso para TypeScript avançado' },
  { nome: 'Testing JavaScript (Kent C. Dodds)',   url: 'testingjavascript.com', desc: 'Referência em testes para JavaScript' },
  { nome: 'EpicReact.dev (Kent C. Dodds)',        url: 'epicreact.dev',         desc: 'Profundidade em React além dos tutoriais' },
  { nome: 'roadmap.sh/frontend ou /nodejs',       url: 'roadmap.sh',            desc: 'Guias de aprendizado estruturados' },
];

console.log('Cursos que substituem certificações:');
cursos.forEach(({ nome, url, desc }) => {
  console.log(`  • ${nome}`);
  console.log(`    ${url} — ${desc}`);
});

console.log('\n💡 Conclusão de curso top pago + projeto demonstrável > certificado de múltipla escolha.');
console.log('   Ambos perdem para código em produção que você pode explicar.');

// Seção 14.2 — tipos de projeto que abrem portas:
// 1. Ferramenta CLI ou biblioteca — demonstra DX, API design, documentação
// 2. Projeto full-stack com problema real
// 3. Contribuição para open source (prova mais forte de competência)

// AWS Associate: 40–60 horas de estudo, foco em serviços práticos
