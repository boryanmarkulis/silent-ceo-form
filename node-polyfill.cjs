// Node.js 25 exposes a broken `localStorage` stub where all methods are undefined.
// Next.js dev tooling checks typeof localStorage then calls localStorage.getItem().
if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      get length() { return 0 },
    },
    writable: true,
    configurable: true,
  })
}
