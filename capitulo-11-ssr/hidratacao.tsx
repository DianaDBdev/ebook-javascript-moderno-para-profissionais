// hidratacao.tsx — Seção 11.3: Hydration — o que é e por que importa
// Capítulo 11 — Server-Side Rendering (SSR): Fundamentos
//
// Execute: npx tsx exemplos/hidratacao.tsx

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.3 — O processo de hydration passo a passo
// ─────────────────────────────────────────────────────────────

// 1. Servidor renderiza HTML:
// const html = ReactDOMServer.renderToString(<App initialData={data} />);
// Resultado: <div><h1>Hello</h1><button>Click</button></div>

// 2. Browser recebe — conteúdo visível, SEM interatividade:
// <div id="root">
//   <h1>Hello</h1>
//   <button>Click me</button>  ← Sem event listener
// </div>

// 3. JavaScript hydrata — React assume controle:
// ReactDOM.hydrateRoot(
//   document.getElementById('root'),
//   <App initialData={data} />
// );
// O HTML NÃO é re-renderizado — apenas conectado ao React
// Event listeners, state e context são adicionados

// 4. Resultado final:
// - HTML já estava visível desde o passo 2 (FCP rápido)
// - Após hydration: onClick, useState, useContext — tudo funcionando

// ─────────────────────────────────────────────────────────────
// SEÇÃO 11.3 — Hydration mismatch — o problema mais comum
// ─────────────────────────────────────────────────────────────

// Se o HTML do servidor for diferente do que o React espera no cliente
// → ocorre mismatch → React re-renderiza tudo → perde o benefício do SSR

// ❌ Problema: Date() retorna valores diferentes no servidor e cliente
// function App() {
//   const now = new Date().toISOString();
//   return <div>Hora: {now}</div>;
// }

// ✅ Solução: executar apenas no cliente com useEffect
// function App() {
//   const [time, setTime] = useState(null);
//   useEffect(() => {
//     setTime(new Date().toISOString()); // Só no cliente
//   }, []);
//   return <div>Hora: {time ?? 'Carregando...'}</div>;
// }

// 💡 Regra de ouro: o render inicial deve ser IDÊNTICO no servidor e no cliente.
//    Tudo que depende do browser vai dentro de useEffect.
//    Alternativa aceitável: suppressHydrationWarning no elemento — use com critério.

// ─────────────────────────────────────────────────────────────
// Outros exemplos de mismatch e soluções
// ─────────────────────────────────────────────────────────────

// ❌ localStorage (não existe no servidor)
// function Component() {
//   const theme = localStorage.getItem('theme'); // ReferenceError no servidor!
//   return <div className={theme}></div>;
// }
//
// ✅ Correto:
// function Component() {
//   const [theme, setTheme] = useState('light');
//   useEffect(() => {
//     setTheme(localStorage.getItem('theme') ?? 'light');
//   }, []);
//   return <div className={theme}></div>;
// }

// ❌ window, document, navigator — não existem no servidor
// function Component() {
//   const isMobile = window.innerWidth < 768; // ReferenceError!
//   ...
// }
//
// ✅ Correto — verificar antes de usar:
// const isBrowser = typeof window !== 'undefined';
// const isMobile = isBrowser ? window.innerWidth < 768 : false;

// ❌ Math.random() — diferente a cada render
// function Component() {
//   const id = Math.random(); // Diferente no servidor e cliente → mismatch
//   return <div id={`item-${id}`}></div>;
// }
//
// ✅ Usar ID determinístico ou useId() do React 18:
// import { useId } from 'react';
// function Component() {
//   const id = useId(); // Consistente no servidor e cliente
//   return <div id={id}></div>;
// }

// ─────────────────────────────────────────────────────────────
// Demo executável — simulação do processo de hydration
// ─────────────────────────────────────────────────────────────

console.log('=== Processo de Hydration (simulado) ===\n');

// Simula renderToString do servidor
function renderToStringServer(component: { type: string; props: Record<string, unknown> }): string {
  const { type, props } = component;
  const content = Object.entries(props)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `<${type} ${content}></${type}>`;
}

// Simula hydrateRoot do cliente
function hydrateRoot(serverHtml: string, clientComponent: { type: string; props: Record<string, unknown> }): { success: boolean; rerendered: boolean } {
  const clientHtml = renderToStringServer(clientComponent);
  const match = serverHtml === clientHtml;
  if (!match) {
    console.log('  ⚠️  MISMATCH detectado!');
    console.log(`     Servidor: ${serverHtml}`);
    console.log(`     Cliente:  ${clientHtml}`);
    console.log('     React re-renderiza tudo — benefício do SSR perdido\n');
  }
  return { success: true, rerendered: !match };
}

// Exemplo 1: sem mismatch
console.log('Exemplo 1 — sem mismatch:');
const serverHtml1 = renderToStringServer({ type: 'h1', props: { class: 'title', children: 'Hello' } });
const result1     = hydrateRoot(serverHtml1, { type: 'h1', props: { class: 'title', children: 'Hello' } });
console.log('  ✅ HTML idêntico — hydration eficiente');
console.log(`  Servidor HTML: ${serverHtml1}`);
console.log(`  Rerenderizado: ${result1.rerendered}\n`);

// Exemplo 2: com mismatch (Date é diferente)
console.log('Exemplo 2 — com mismatch (timestamp):');
const serverHtml2 = renderToStringServer({ type: 'div', props: { ts: '2026-01-01T00:00:00.000Z' } });
hydrateRoot(serverHtml2, { type: 'div', props: { ts: new Date().toISOString() } });

// Exemplo 3: corrigido com useEffect
console.log('Exemplo 3 — corrigido (renderiza null no servidor, atualiza no cliente):');
const serverHtml3 = renderToStringServer({ type: 'div', props: { ts: 'Carregando...' } });
const result3     = hydrateRoot(serverHtml3, { type: 'div', props: { ts: 'Carregando...' } });
console.log('  ✅ Render inicial idêntico — useEffect atualiza depois no cliente');
console.log(`  Rerenderizado: ${result3.rerendered}`);

console.log('\n=== Regras anti-mismatch ===\n');
const regras = [
  'Date.now() / new Date() → useState(null) + useEffect → setTime(new Date())',
  'localStorage / sessionStorage → typeof window !== "undefined" guard',
  'window / document / navigator → typeof window check ou useEffect',
  'Math.random() → useId() do React 18 ou ID determinístico',
  'navigator.userAgent → header User-Agent no servidor (consistente)',
];
regras.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
