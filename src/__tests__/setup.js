import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';

/**
 * jsdom does not always hand us Web Storage here (Node 26 defines its own
 * `localStorage` global, which is inert unless the process was started with
 * `--localstorage-file`). Everything under test reads storage through the
 * `localStorage` / `sessionStorage` globals, so supply an in-memory Storage when
 * the environment has not.
 */
function createMemoryStorage() {
  const entries = new Map();

  return {
    get length() {
      return entries.size;
    },
    key: (index) => Array.from(entries.keys())[index] ?? null,
    getItem: (key) => (entries.has(String(key)) ? entries.get(String(key)) : null),
    setItem: (key, value) => entries.set(String(key), String(value)),
    removeItem: (key) => entries.delete(String(key)),
    clear: () => entries.clear(),
  };
}

function ensureStorage(name) {
  if (globalThis[name] && typeof globalThis[name].clear === 'function') return;

  const storage = createMemoryStorage();
  const descriptor = { value: storage, configurable: true, writable: true };

  Object.defineProperty(globalThis, name, descriptor);
  if (globalThis.window && globalThis.window !== globalThis) {
    Object.defineProperty(globalThis.window, name, descriptor);
  }
}

ensureStorage('localStorage');
ensureStorage('sessionStorage');

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
