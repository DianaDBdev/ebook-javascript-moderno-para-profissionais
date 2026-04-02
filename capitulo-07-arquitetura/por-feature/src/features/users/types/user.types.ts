// user.types.ts — Tipos da feature users
// Centralizar tipos aqui garante consistência em toda a feature.

export interface User {
  id:         number;
  nome:       string;
  email:      string;
  cargo?:     string;
  ativo:      boolean;
  criadoEm:  string; // ISO string
}

export interface CreateUserInput {
  nome:   string;
  email:  string;
  cargo?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  ativo?: boolean;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
