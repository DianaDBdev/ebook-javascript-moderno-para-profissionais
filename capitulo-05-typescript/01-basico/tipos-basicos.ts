// tipos-basicos.ts — Os tipos que resolvem 80% dos casos
// Execute: npx tsx 01-basico/tipos-basicos.ts

// ──────────────────────────────────────────────
// Tipos primitivos e inferência
// ──────────────────────────────────────────────
const nome: string  = 'Diana';
const idade: number = 28;
const ativo: boolean = true;

// TypeScript infere o tipo — não precisa anotar sempre
const cidade = 'Belém';        // inferido como string
const ano    = 2026;           // inferido como number

// ──────────────────────────────────────────────
// Arrays e Tuplas
// ──────────────────────────────────────────────
const nomes: string[]    = ['Diana', 'Ana', 'Carlos'];
const numeros: number[]  = [1, 2, 3];
const misto: (string | number)[] = ['a', 1, 'b', 2];

// Tupla — array com tipos e tamanho fixos
const coordenada: [number, number] = [-1.455, -48.502]; // lat/lng de Belém
const entrada:    [string, number] = ['temperatura', 37];

// ──────────────────────────────────────────────
// Objetos com interface
// ──────────────────────────────────────────────
interface Usuario {
  id:      number;
  nome:    string;
  email:   string;
  cargo?:  string;           // ? = opcional
  readonly criadoEm: Date;   // readonly = não pode ser reatribuído
}

const usuario: Usuario = {
  id:        1,
  nome:      'Diana',
  email:     'diana@db.dev',
  criadoEm:  new Date(),
};

// usuario.criadoEm = new Date(); // ❌ Erro: readonly

// ──────────────────────────────────────────────
// Union types — um ou outro
// ──────────────────────────────────────────────
type Status = 'ativo' | 'inativo' | 'pendente';
type ID     = string | number;

function ativarUsuario(status: Status): void {
  if (status === 'ativo') console.log('Já está ativo');
}

// ──────────────────────────────────────────────
// Funções tipadas
// ──────────────────────────────────────────────
function somar(a: number, b: number): number {
  return a + b;
}

// Arrow function com tipo explícito
const multiplicar = (a: number, b: number): number => a * b;

// Função async
async function buscarUsuario(id: number): Promise<Usuario | null> {
  if (id <= 0) return null;
  return { id, nome: 'Diana', email: 'diana@db.dev', criadoEm: new Date() };
}

const user = await buscarUsuario(1);
console.log(user?.nome); // optional chaining pois pode ser null
