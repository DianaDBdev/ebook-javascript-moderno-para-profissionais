// main.js — Dynamic import()
// O módulo admin-panel.js NÃO é carregado na inicialização.
// Só é baixado e executado quando esta função for chamada.

async function loadAdminPanel() {
  console.log('Carregando painel admin...');

  // import() retorna uma Promise — use await
  const adminPanel = await import('./admin-panel.js');

  adminPanel.init();
  adminPanel.renderDashboard();
}

// Simulando um clique de botão
console.log('Aplicação iniciada (admin ainda não carregado)');
await loadAdminPanel();
console.log('Pronto!');

// --- Carregamento condicional ---
async function loadEditor(isMobile) {
  if (isMobile) {
    // Carrega APENAS o editor mobile
    const { MobileEditor } = await import('./mobile-editor.js').catch(() => {
      // Fallback se o arquivo não existir neste exemplo
      return { MobileEditor: class { start() { console.log('Mobile Editor'); } } };
    });
    return new MobileEditor();
  } else {
    console.log('Desktop editor seria carregado aqui');
  }
}
