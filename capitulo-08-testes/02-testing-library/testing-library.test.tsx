// testing-library.test.tsx — Seção 8.3: Testing Library (comportamento, não implementação)
// Capítulo 8 — Testing no Mundo Moderno
//
// Este arquivo demonstra a filosofia e os padrões do Testing Library.
// Em um projeto real, execute com: npx vitest run

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Filosofia: comportamento vs implementação
// ─────────────────────────────────────────────────────────────

// ❌ Testando implementação — frágil
// it('atualiza o estado quando clica no botão', () => {
//   const { result } = renderHook(() => useCounter());
//   act(() => result.current.increment());
//   expect(result.current.count).toBe(1); // Detalhe interno
//   // Se renomear 'count' para 'value', o teste quebra
//   // Mas o comportamento do usuário não mudou!
// });

// ✅ Testando comportamento — resiliente
// it('mostra contador incrementado ao clicar', async () => {
//   render(<Counter />);
//   expect(screen.getByText('0')).toBeInTheDocument();
//   await userEvent.click(screen.getByRole('button', { name: /incrementar/i }));
//   expect(screen.getByText('1')).toBeInTheDocument();
//   // Renomeie variáveis internas à vontade — esse teste não quebra
// });

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Queries: prioridade recomendada
// ─────────────────────────────────────────────────────────────

// 1. getByRole — preferência máxima (força HTML semântico + acessibilidade):
//   screen.getByRole('button', { name: /salvar/i })
//   screen.getByRole('textbox', { name: /email/i })
//   screen.getByRole('heading', { name: /bem-vindo/i })
//   screen.getByRole('checkbox', { name: /aceito os termos/i })
//   screen.getByRole('link', { name: /voltar/i })

// 2. getByLabelText — formulários:
//   screen.getByLabelText('Nome completo')
//   screen.getByLabelText(/email/i)

// 3. getByPlaceholderText — quando não há label:
//   screen.getByPlaceholderText('Digite seu email')

// 4. getByText — texto visível:
//   screen.getByText('Bem-vindo, Maria!')
//   screen.getByText(/carregando/i)

// 5. getByTestId — ÚLTIMO RECURSO:
//   screen.getByTestId('user-avatar') // data-testid no elemento
//   ⚠️  Evite — se só consegue por testId, o componente tem problema de acessibilidade.
//   💡  getByRole força HTML semântico. Um botão sem name acessível falha no teste.

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Variantes de query
// ─────────────────────────────────────────────────────────────

// getBy   — lança erro se não encontrar (síncrono):
//   const btn = screen.getByRole('button', { name: /salvar/i });

// queryBy — retorna null se não encontrar (para verificar ausência):
//   const modal = screen.queryByRole('dialog');
//   expect(modal).not.toBeInTheDocument();

// findBy  — aguarda aparecer, retorna Promise (para elementos assíncronos):
//   const user = await screen.findByText('Maria Silva');

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — userEvent vs fireEvent
// ─────────────────────────────────────────────────────────────

// import userEvent from '@testing-library/user-event';
//
// ❌ fireEvent — dispara apenas o evento, não simula o usuário
//   fireEvent.click(button);
//   fireEvent.change(input, { target: { value: 'Maria' } });
//
// ✅ userEvent — simula interação humana completa (foco, hover, teclado)
//   const user = userEvent.setup();
//   await user.click(button);
//   await user.type(input, 'Maria');   // Digita letra por letra
//   await user.clear(input);           // Limpa o campo
//   await user.selectOptions(select, 'admin');
//   await user.upload(fileInput, file);

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Teste de formulário completo
// ─────────────────────────────────────────────────────────────

// import { render, screen }  from '@testing-library/react';
// import userEvent           from '@testing-library/user-event';
// import { LoginForm }       from './LoginForm';
//
// describe('LoginForm', () => {
//   const mockOnSubmit = vi.fn(); // limpo pelo vi.clearAllMocks() no setup.ts
//
//   beforeEach(() => {
//     render(<LoginForm onSubmit={mockOnSubmit} />);
//   });
//
//   it('submete com credenciais válidas', async () => {
//     const user = userEvent.setup();
//     await user.type(screen.getByLabelText(/email/i), 'maria@ex.com');
//     await user.type(screen.getByLabelText(/senha/i), 'senha123');
//     await user.click(screen.getByRole('button', { name: /entrar/i }));
//     expect(mockOnSubmit).toHaveBeenCalledWith({
//       email:    'maria@ex.com',
//       password: 'senha123',
//     });
//   });
//
//   it('exibe erro para email inválido', async () => {
//     const user = userEvent.setup();
//     await user.type(screen.getByLabelText(/email/i), 'nao-e-email');
//     await user.click(screen.getByRole('button', { name: /entrar/i }));
//     expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
//     expect(mockOnSubmit).not.toHaveBeenCalled();
//   });
// });

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Componente com dados assíncronos
// ─────────────────────────────────────────────────────────────

// vi.mock('../services/userService');
//
// describe('UserProfile', () => {
//   it('exibe dados do usuário após carregamento', async () => {
//     vi.mocked(userService.findById).mockResolvedValue({
//       id: 1, name: 'Maria Silva', email: 'maria@ex.com', role: 'admin',
//     });
//
//     render(<UserProfile userId={1} />);
//
//     // Verificar estado de carregamento
//     expect(screen.getByRole('status')).toHaveTextContent(/carregando/i);
//     // em produção, prefira role='progressbar' para spinners —
//     // 'status' é mais adequado para notificações ao vivo
//
//     // Aguardar dados carregarem
//     expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
//     expect(screen.getByText('maria@ex.com')).toBeInTheDocument();
//     expect(screen.getByText('admin')).toBeInTheDocument();
//     expect(screen.queryByRole('status')).not.toBeInTheDocument();
//   });
// });

// ─────────────────────────────────────────────────────────────
// SEÇÃO 8.3 — Custom render com providers
// ─────────────────────────────────────────────────────────────

// src/test/render.tsx — evita repetição de providers em cada teste:
//
// import { ReactNode }        from 'react';
// import { render }           from '@testing-library/react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter }    from 'react-router-dom';
// import { AuthProvider }     from '../contexts/AuthContext';
//
// function AllProviders({ children }: { children: ReactNode }) {
//   const queryClient = new QueryClient({
//     defaultOptions: { queries: { retry: false } }, // Sem retry em testes
//   });
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <AuthProvider>{children}</AuthProvider>
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }
//
// export const renderWithProviders = (ui: React.ReactElement) =>
//   render(ui, { wrapper: AllProviders });
//
// // Uso nos testes:
// import { renderWithProviders } from '../test/render';
// it('exibe painel do admin', async () => {
//   renderWithProviders(<AdminPanel />);
//   expect(await screen.findByText('Dashboard')).toBeInTheDocument();
// });

// ─────────────────────────────────────────────────────────────
// CASO REAL — PaymentForm (Seção 8.5)
// ─────────────────────────────────────────────────────────────

// describe('PaymentForm', () => {
//   it('bloqueia envio com cartão expirado', async () => {
//     const user = userEvent.setup();
//     render(<PaymentForm onSuccess={vi.fn()} />);
//     await user.type(screen.getByLabelText(/número do cartão/i), '4111111111111111');
//     // 4111111111111111 = número de cartão de teste padrão Visa
//     // nunca use números reais em testes
//     await user.type(screen.getByLabelText(/validade/i), '01/20'); // Expirado
//     await user.type(screen.getByLabelText(/cvv/i), '123');
//     await user.click(screen.getByRole('button', { name: /pagar/i }));
//     expect(screen.getByRole('alert')).toHaveTextContent('Cartão expirado');
//   });
// });

// ─────────────────────────────────────────────────────────────
// Instalação (comentário de referência)
// ─────────────────────────────────────────────────────────────

// npm install -D @testing-library/react @testing-library/user-event
// npm install -D @testing-library/jest-dom
// # Para Vue:  npm install -D @testing-library/vue
// # Para APIs: npm install -D @testing-library/dom

// findBy — aguarda aparecer, retorna Promise (para elementos assíncronos):
// Use para elementos que aparecem após fetch, animação, timer.
// Variantes: getBy (lança erro), queryBy (retorna null), findBy (Promise)
