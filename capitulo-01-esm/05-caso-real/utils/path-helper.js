// path-helper.js — Utilitário reutilizável para __dirname em ESM
// Copie este arquivo para qualquer projeto que precisar de __dirname ou __filename.

import { fileURLToPath } from 'url';
import { dirname }       from 'path';

/**
 * Recria __dirname e __filename para módulos ESM.
 *
 * @param {string} importMetaUrl - Passe `import.meta.url` do módulo que está chamando
 * @returns {{ filename: string, dirname: string }}
 *
 * @example
 * import { getModulePath } from './utils/path-helper.js';
 * const { dirname: __dirname } = getModulePath(import.meta.url);
 */
export function getModulePath(importMetaUrl) {
  const filename = fileURLToPath(importMetaUrl);
  return {
    filename,
    dirname: dirname(filename),
  };
}
