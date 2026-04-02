# Ferramentas de IA no Workflow — Capítulo 14

## As 3 ferramentas dominantes em 2026

| Ferramenta      | Melhor para                               | Preço (referência) |
|-----------------|-------------------------------------------|--------------------|
| **Cursor**      | Refatorações complexas, contexto de codebase inteiro | US$ 20/mês |
| **GitHub Copilot** | Autocomplete, integração GitHub/VS Code | US$ 10/mês |
| **Claude Code** | Tarefas multi-arquivo, raciocínio arquitetural | US$ 20/mês (Pro) |

---

## Como usar com critério profissional

### ✅ Use IA para:
- Gerar boilerplate (testes, interfaces TypeScript, configs)
- Explicar código legado desconhecido
- Sugerir refatorações e identificar antipadrões
- Documentar funções e módulos
- Gerar casos de teste a partir de uma especificação

### ⚠️ Revise com atenção quando IA gerar:
- Lógica de negócio crítica
- Código de autenticação e autorização
- Queries de banco de dados com dados sensíveis
- Integrações de pagamento

### ❌ Não delegue para IA:
- Decisões arquiteturais sem revisão humana
- Código que você não consegue explicar linha por linha
- Deploy em produção sem revisão de diff completo

---

## Checklist de uso responsável

- [ ] Eu li e entendo todo o código que vou commitar
- [ ] Rodei os testes após aceitar sugestões da IA
- [ ] Não há dados sensíveis (tokens, senhas) no prompt enviado à IA
- [ ] O código gerado segue os padrões do projeto (lint, tipos)
- [ ] Revisei edge cases que a IA pode ter ignorado

---

## Prompts úteis para desenvolvedores

```
# Gerar testes
"Escreva testes Vitest para esta função. 
Cubra: caso feliz, entrada inválida, e edge cases de [especifique]."

# Revisar código
"Revise este código e aponte: bugs, antipadrões, 
oportunidades de otimização e problemas de segurança."

# Refatorar
"Refatore esta função para ser mais legível e testável, 
mantendo a mesma interface pública. Explique cada mudança."

# Migrar
"Converta este código CommonJS para ESM. 
Trate __dirname e imports de JSON conforme Node.js 20+."
```
