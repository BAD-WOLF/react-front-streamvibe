/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * Endereço da API (sem barra no fim), ex.: https://api.seudominio.com.
     * `{hostname}` vira o host em que o front foi aberto (dev: http://{hostname}:8000).
     */
    readonly VITE_BACKEND_API_DOMAIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
