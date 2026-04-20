# Checklist de Skills Modernas — Capítulo 14

Use este checklist para identificar suas próximas oportunidades de crescimento.
Baseado no Capítulo 14 do livro *JavaScript Moderno para Profissionais*.

---

## Fundamentos modernos

- [ ] ESM: uso `import`/`export` em todos os projetos novos
- [ ] Async/await: sem callback hell, `Promise.all` para operações paralelas
- [ ] Destructuring, spread, optional chaining, nullish coalescing como segunda natureza
- [ ] Array methods: mapa, filtra, reduz sem loops `for`

## Ferramentas

- [ ] TypeScript com `strict: true` em projetos novos
- [ ] Vite ou equivalente moderno como bundler
- [ ] ESLint flat config + Prettier configurados
- [ ] Husky + lint-staged + Conventional Commits

## Arquitetura

- [ ] Estrutura feature-first com `index.ts` como API pública
- [ ] Separação de concerns: UI, estado, serviço, infraestrutura
- [ ] Dependency injection sem framework

## Qualidade

- [ ] Vitest para testes unitários e de integração
- [ ] Testing Library para componentes — comportamento, não implementação
- [ ] Playwright para pelo menos 3 fluxos E2E críticos
- [ ] Coverage com thresholds no CI

## Deploy e operações

- [ ] CI/CD com quality gate em todo PR
- [ ] Logs estruturados com Pino ou equivalente
- [ ] Health check endpoint com verificação de dependências
- [ ] Performance budget com Lighthouse CI

## Carreira

- [ ] Portfólio com pelo menos 1 projeto com README de qualidade
- [ ] Aprendizado em público — pelo menos 1 post por mês
- [ ] Contribuição para open source — pelo menos 1 PR no último ano
- [ ] ADR documentado para a última decisão técnica importante

---

## Portfólio — o que funciona e o que não funciona

### ❌ Projetos que são ignorados por recrutadores técnicos

- Todo List — sem problema real, sem decisão técnica
- Clone de site famoso sem decisão arquitetural documentada
- Projeto sem testes, sem TypeScript, sem CI/CD
- Repositório com 1 commit — claramente feito para o portfólio
- README apenas com "how to run" — sem contexto ou decisões

### ✅ Projetos que abrem portas

1. **Problema real documentado** — resolve algo que você mesmo teve
2. **Stack moderno com propósito** — TypeScript, testes, CI passando
3. **Decisões documentadas** — por que X em vez de Y no README
4. **Commits atômicos** — mensagens descritivas (Conventional Commits)

### Os 5 minutos do recrutador técnico

1. README: qual problema resolve, como rodar, decisões tomadas
2. `package.json`: TypeScript? Testes? Linting?
3. Um arquivo de teste: você escreve testes?
4. GitHub Actions: CI passando no último commit?
5. Uma PR ou issue antiga: você sabe colaborar?

---

## Os 30 dias seguintes

### Semana 1 — Diagnóstico
- [ ] Avalie seu projeto principal: quantos arquivos têm TypeScript?
- [ ] Execute Lighthouse no seu projeto — qual é seu LCP?
- [ ] Escreva honestamente quais skills deste livro você ainda não aplicou

### Semana 2 — Primeira ação concreta (escolha UMA)
- [ ] Sem testes? Escreva characterization tests para o módulo mais crítico
- [ ] Sem TypeScript? Adicione `allowJs: true` e crie o primeiro arquivo `.ts`
- [ ] Sem CI? Crie o primeiro workflow de quality gate

### Semana 3 — Portfólio
- [ ] Escolha um projeto existente e escreva o README que ele merece
- [ ] Documente pelo menos uma decisão técnica na seção "Decisões Técnicas"
- [ ] Adicione o badge de CI

### Semana 4 — Visibilidade
- [ ] Escreva um post curto sobre algo que você aprendeu este mês
- [ ] Compartilhe com uma pessoa que você respeita tecnicamente

---

## Caso Real — R$ 3.200 → US$ 5.500/mês em 4 anos

| Ano | Evento chave | Salário |
|-----|-------------|---------|
| 2020 | Dev júnior em agência, jQuery + WordPress | R$ 3.200/mês |
| Ano 1 | Node.js + React + TypeScript + 2 PRs em open source | R$ 6.500/mês (+103%) |
| Ano 2 | Testes, feature-first, biblioteca @br-validators (500 stars) | US$ 3.500/mês (~R$ 17.500) |
| Ano 3 | Liderou migração Webpack→Vite, 8 ADRs, mentorou 2 devs | US$ 5.500/mês (~R$ 27.500) |
| Ano 4 | Tech Lead — stack: TS, Next.js App Router, tRPC, Vitest, Playwright | US$ 5.500/mês |

**O que funcionou:**
- Consistência: um projeto pessoal de qualidade + um post + uma contribuição — toda semana
- Visibilidade: biblioteca open source abriu mais portas do que qualquer certificado
- Documentação: ADRs e READMEs demonstraram capacidade de comunicação técnica
- Profundidade: dominar TypeScript profundamente > conhecer 20 tecnologias superficialmente

**Reflexão do desenvolvedor:**
> "O salto maior não veio de aprender uma tecnologia nova. Veio quando comecei a
> documentar e compartilhar o que estava aprendendo. A biblioteca open source me
> abriu mais portas do que qualquer certificado."

---

## Recursos

- [Total TypeScript](https://totaltypescript.com) — Matt Pocock
- [Testing JavaScript](https://testingjavascript.com) — Kent C. Dodds
- [JavaScript Weekly](https://javascriptweekly.com) — Newsletter curada
- [roadmap.sh](https://roadmap.sh) — Guias de aprendizado estruturados
- [Good First Issues](https://goodfirstissues.com) — Issues para contribuir
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)

---

## Notas do Caso Real

- 2 PRs aceitos em projetos menores (correção de tipos no axios-mock) — Ano 1
- Liderou migração Webpack → Vite (3 devs, 2 meses) — Ano 3
- "O salto maior não veio de aprender uma tecnologia nova..." — reflexão do dev
