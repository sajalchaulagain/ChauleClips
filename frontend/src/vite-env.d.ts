/// <reference types="vite/client" />

/** Typed access to the VITE_* variables we actually use (see .env.example). */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_DOCS_URL?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
