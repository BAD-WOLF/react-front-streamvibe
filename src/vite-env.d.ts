/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Endereço da API (sem barra no fim), ex.: http://localhost:8000 */
    readonly VITE_BACKEND_API_DOMAIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
