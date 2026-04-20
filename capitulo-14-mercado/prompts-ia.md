# Prompts para Ferramentas de IA — Capítulo 14

Prompts testados para GitHub Copilot, Cursor e Claude Code.
Baseado na Seção 14.6 do livro *JavaScript Moderno para Profissionais*.

---

## Gerar testes

```
Escreva testes Vitest para esta função.
Cubra: caso feliz, entrada inválida, e edge cases de [especifique].
Use TypeScript. Não use mocks desnecessários.
```

## Revisar código

```
Revise este código e aponte:
- Bugs ou comportamentos inesperados
- Antipadrões JavaScript/TypeScript
- Oportunidades de otimização de performance
- Problemas de segurança evidentes
```

## Refatorar

```
Refatore esta função para ser mais legível e testável.
Mantenha a mesma interface pública.
Explique cada mudança e o motivo.
```

## Migrar CJS → ESM

```
Converta este código CommonJS para ESM (Node.js 20+).
Trate __dirname, __filename e imports de JSON.
Adicione extensões .js nos imports relativos.
```

## Explicar código legado

```
Explique o que este código faz, quais são seus side effects,
e por que pode ter sido escrito desta forma.
Não sugira refatorações ainda.
```

## Gerar ADR

```
Com base nesta decisão técnica, gere um ADR no formato:
# Status, # Contexto, # Decisão, # Consequências, # Alternativas, # Data
Decisão: [descreva aqui]
```

## Escrever issue de bug

```
Com base neste bug que estou tendo, escreva um issue bem formatado
com: Descrição, Comportamento atual, Comportamento esperado,
Reprodução mínima, Ambiente.
Bug: [descreva aqui]
```

---

## Ferramentas 2026

| Ferramenta | Tipo | Melhor em |
|------------|------|-----------|
| **GitHub Copilot** | Extensão IDE | Autocomplete inline, sugestões contextuais, integração GitHub |
| **Cursor** | IDE nativo de IA | Contexto de codebase inteiro, refatorações complexas |
| **Claude Code** | Agente CLI | Tarefas multi-arquivo, raciocínio arquitetural profundo |

---

## Regras de ouro

1. **Sempre revise** o código gerado antes de commitar
2. **Peça explicações**, não apenas código — use IA para aprender
3. **Descreva o contexto** — quanto mais contexto, melhor o resultado
4. **Itere** — o primeiro resultado raramente é o melhor
5. **Saiba quando não usar** — lógica crítica, segurança, código com estado global

> "A habilidade de 2026 não é saber usar IA. É saber quando não usar — e por quê."
> — Capítulo 14, *JavaScript Moderno para Profissionais*
