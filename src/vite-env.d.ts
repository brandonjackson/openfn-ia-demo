/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "lightning" when the app is built to run on a real Lightning (src/api/source.ts); otherwise the fake server answers. */
  readonly VITE_API_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
