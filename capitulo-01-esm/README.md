# Capítulo 1 — ESM (ECMAScript Modules): O Novo Padrão

> Exemplos de código do **Capítulo 1** do livro *JavaScript Moderno para Profissionais*.

---

## 📁 Arquivos deste capítulo

```
capitulo-01-esm/
├── README.md
├── package.json
├── 01-named-exports/
│   ├── utils.js          # Named exports
│   └── main.js           # Importando named exports
├── 02-default-exports/
│   ├── User.js           # Default export (classe)
│   └── main.js
├── 03-dynamic-import/
│   ├── admin-panel.js    # Módulo carregado sob demanda
│   └── main.js           # Dynamic import()
├── 04-migracao-cjs/
│   ├── antes/            # Código original em CommonJS
│   │   └── app.js
│   └── depois/           # Código migrado para ESM
│       └── app.js
└── 05-caso-real/
    ├── utils/
    │   └── path-helper.js  # Utilitário para __dirname em ESM
    └── app.js
```

## ▶️ Como executar

```bash
cd capitulo-01-esm
node 01-named-exports/main.js
node 02-default-exports/main.js
node 03-dynamic-import/main.js
```

> **Node.js 18+** necessário. O arquivo `package.json` já tem `"type": "module"`.

---

## 💡 Conceitos do capítulo

- Por que ESM substituiu CommonJS
- Named exports vs Default exports
- Dynamic import para code splitting
- Migração prática de `require()` para `import`
- Como usar `__dirname` em ESM (não existe nativamente)
