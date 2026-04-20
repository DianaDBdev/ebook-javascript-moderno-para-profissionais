# Capítulo 14 — Skills para o Mercado Atual

> Exemplos de código do livro **JavaScript Moderno para Profissionais**
> Diana Barbosa · Victor Pitts — 2026

---

## O que você vai aprender

- O que empresas realmente avaliam em 2026 (stack, salários, diferencial TypeScript)
- Como construir um portfólio que demonstra competência, não apenas código
- Sistema dos três horizontes para se manter atualizado sem burnout
- Certificações que têm valor real — e o que vale mais que certificados
- Contribuição para open source: do typo ao PR aceito
- IA no workflow: GitHub Copilot, Cursor, Claude Code — como e quando usar
- Caso Real: R$ 3.200 → US$ 5.500/mês em 4 anos com consistência e visibilidade

---

## Arquivos deste capítulo

| Arquivo | Seção | O que demonstra |
|---------|-------|-----------------|
| [`exemplos/mercado-2026.js`](exemplos/mercado-2026.js) | 14.1 + 14.4 | O que mudou nas contratações, salários com/sem TypeScript, tendências, certificações AWS, cursos que substituem certificados |
| [`exemplos/aprendizado-sustentavel.js`](exemplos/aprendizado-sustentavel.js) | 14.3 | FOMO técnico, sistema dos três horizontes (70/20/10%), fontes filtradas, regra dos 20min/dia, aprendizado em público, framework para priorizar tecnologias |
| [`exemplos/opensource-guide.js`](exemplos/opensource-guide.js) | 14.5 | Caminho progressivo (doc → bug repro → bugs → features), labels, issue e PR bem escritos, publicar no npm, Caso Real @br-validators |
| [`exemplos/ia-workflow.js`](exemplos/ia-workflow.js) | 14.6 | Copilot vs Cursor vs Claude Code, o que empresas esperam, prompts que funcionam, limitações críticas |
| [`exemplos/portfolio-readme.md`](exemplos/portfolio-readme.md) | 14.2 | Template completo de README que impressiona — com problema, decisões técnicas, stack, arquitetura, aprendizados |
| [`checklist-portfolio.md`](checklist-portfolio.md) | 14.1–14.6 | Checklist completo de skills, portfólio, plano de 30 dias, Caso Real com tabela de progressão salarial |
| [`exemplos/prompts-ia.md`](exemplos/prompts-ia.md) | 14.6 | Prompts testados para testes, revisão, refatoração, migração CJS→ESM, ADR, issue de bug |

---

## Como executar

```bash
cd capitulo-14-mercado
node exemplos/mercado-2026.js
node exemplos/aprendizado-sustentavel.js
node exemplos/opensource-guide.js
node exemplos/ia-workflow.js
```

Os arquivos `.md` são referências para consulta direta.

---

## Mapa por seção

### 14.1 — O que empresas avaliam em 2026

```
✅ TypeScript: de diferencial para pré-requisito em 80% das vagas
✅ "Você usa TypeScript" < "Você entende como os tipos resolvem problemas reais"
✅ Profundidade em 5 > superficialidade em 20 tecnologias

Salários (Brasil 2026):
  JS sem TS:          Júnior R$ 3k–5k  | Pleno R$ 6k–9k  | Sênior R$ 10k–15k
  TS + stack moderno: Júnior R$ 4.5k–7k | Pleno R$ 9k–14k | Sênior R$ 15k–25k+
  Internacional:      Pleno US$ 3k–6k/mês | Sênior US$ 6k–12k/mês
```

### 14.2 — Portfólio que funciona

```
❌ Todo List (ignorado) | ❌ Clone sem decisões | ❌ 1 commit | ❌ README só "how to run"

✅ Problema real + Stack moderna com propósito + Decisões documentadas + CI passando

Template README:
  ## O Problema → ## Decisões Técnicas → ## Stack → ## Arquitetura → ## O que aprendi
```

### 14.3 — Sistema dos três horizontes

```
H1 (70%): Domínio profundo — tecnologias que você usa hoje
H2 (20%): Acompanhamento consciente — 1–2 anos de horizonte
H3 (10%): Radar — apenas monitorar, sem investir tempo agora

Regra dos 20min/dia: consistência bate intensidade
Aprendizado em público: compartilhar o processo > compartilhar resultados perfeitos
```

### 14.5 — Open source progressivo

```
Nível 1: Typo/documentação → bem-vindo em qualquer projeto
Nível 2: Reproduzir bugs → já te coloca na lista de "quem ajudou"
Nível 3: good-first-issue → microsoft/TypeScript, vitejs/vite, trpc/trpc, colinhacks/zod
Nível 4: Features → sempre abra issue ANTES de implementar

⚠️ Um PR rejeitado por falta de discussão prévia é tempo perdido
```

### 14.6 — IA no workflow

```
Copilot:    autocomplete inline, integração GitHub nativa
Cursor:     contexto de codebase inteiro, refatorações complexas
Claude Code: tarefas multi-arquivo, raciocínio arquitetural

85% dos devs já usam IA. O diferencial é saber QUANDO NÃO usar.
```

---

## Caso Real — R$ 3.200 → US$ 5.500/mês em 4 anos

| Ano | Evento chave | Salário |
|-----|-------------|---------|
| 2020 | Júnior em agência, jQuery + WordPress | R$ 3.200/mês |
| Ano 1 | Node.js + React + TS + 2 PRs open source | R$ 6.500/mês (+103%) |
| Ano 2 | @br-validators: 500 stars, 3 empresas usando | US$ 3.500/mês (~R$ 17.500) |
| Ano 3 | Liderou Webpack→Vite, 8 ADRs, mentorou 2 devs | US$ 5.500/mês (+57%) |

> "O salto maior não veio de aprender uma tecnologia nova. Veio quando comecei
> a documentar e compartilhar o que estava aprendendo."

---

## Recursos

- [Total TypeScript](https://totaltypescript.com) — Matt Pocock
- [Testing JavaScript](https://testingjavascript.com) — Kent C. Dodds
- [JavaScript Weekly](https://javascriptweekly.com) — Newsletter curada
- [roadmap.sh](https://roadmap.sh) — Guias de aprendizado
- [Good First Issues](https://goodfirstissues.com) — Issues para contribuir
- [Repositório do livro](https://github.com/DianaDBdev/ebook-javascript-moderno-para-profissionais)
