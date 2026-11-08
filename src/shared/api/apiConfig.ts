import type {Locale} from '@i18n/locales.ts';

// NOTA (nov/2026): o endereço vem do .env (VITE_BACKEND_API_DOMAIN). A barra
// final é removida para não gerar "//" nos caminhos. `{hostname}` vira o host
// em que o front foi aberto: em dev, com http://{hostname}:8000, o front
// aberto por localhost, pelo IP do WSL ou por outra máquina da rede chama a
// API no mesmo host — o mesmo "site" para o navegador, que então manda o
// cookie do refresh token (SameSite=Strict).
export const API_BASE_URL: string = (import.meta.env.VITE_BACKEND_API_DOMAIN ?? '')
    .replace('{hostname}', window.location.hostname)
    .replace(/\/+$/, '');

/** Caminho de uma rota com prefixo de idioma: /{locale}/api + path. */
export function localizedPath(locale: Locale, path: string): string {
    return `/${locale}/api${path}`;
}

export function absoluteUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}

/** O Swagger da API (documentação interativa de todas as rotas). */
export function apiDocsUrl(locale: Locale): string {
    return absoluteUrl(localizedPath(locale, '/docs'));
}
