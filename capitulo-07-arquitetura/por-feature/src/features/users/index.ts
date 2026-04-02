// src/features/users/index.ts
// API pública da feature users — só exporta o que outras features precisam saber.
// Internals (hooks de validação, helpers, etc.) ficam fora daqui.

export { UserCard }    from './components/UserCard';
export { UserList }    from './components/UserList';
export { useUser }     from './hooks/useUser';
export { userService } from './services/userService';
export type { User, CreateUserInput } from './types/user.types';

// ✅ Quem importa de fora usa:
//    import { UserCard, useUser } from '@/features/users';
//
// ❌ Imports diretos em internals são proibidos por convenção:
//    import { useUserValidation } from '@/features/users/hooks/useUserValidation'; // não faça isso
