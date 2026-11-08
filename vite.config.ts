import react from '@vitejs/plugin-react';
import path from 'path';
import {type ConfigEnv, defineConfig, type HtmlTagDescriptor, loadEnv, type Plugin, type UserConfig} from 'vite';
import tailwindcss from "@tailwindcss/vite";
import yaml from '@modyfi/vite-plugin-yaml';
import {fileURLToPath} from "url";

const __filename:string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

/**
 * NOTA (nov/2026): Content-Security-Policy do build de produção, numa <meta>
 * no começo do index.html. Diz ao navegador de onde a página pode carregar
 * cada coisa; um script injetado (XSS) não roda nem manda dados para outro
 * servidor. Cada origem de fora tem um motivo:
 * - connect-src: a API (VITE_BACKEND_API_DOMAIN; `{hostname}` vira `*`, já
 *   que o host só é conhecido quando a página abre);
 * - img-src: as imagens do TMDB (image.tmdb.org), as miniaturas do YouTube
 *   (i.ytimg.com) e o logo (files.catbox.moe); data: e blob: são as imagens
 *   que a API entrega em base64 ou em arquivo;
 * - frame-src: os trailers (o player do YouTube num iframe).
 * style-src aceita 'unsafe-inline' por causa dos estilos que as bibliotecas
 * de animação escrevem nos elementos. Só no build: o servidor de dev do Vite
 * injeta scripts inline (o recarregamento a quente) que a política barraria.
 * frame-ancestors não vale numa <meta>: ele vai como header, no serve.json.
 */
function contentSecurityPolicy(apiBaseUrl: string): Plugin {
    const apiOrigin: string = /^https?:\/\/[^/]+/i.exec(apiBaseUrl.replace('{hostname}', '*'))?.[0] ?? '';
    const policy: string = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        `connect-src 'self'${apiOrigin !== '' ? ` ${apiOrigin}` : ''}`,
        "img-src 'self' data: blob: https://image.tmdb.org https://i.ytimg.com https://files.catbox.moe",
        "font-src 'self' data:",
        "media-src 'self' blob:",
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');

    return {
        name: 'streamvibe-content-security-policy',
        apply: 'build',
        transformIndexHtml: (): HtmlTagDescriptor[] => [{
            tag: 'meta',
            attrs: {'http-equiv': 'Content-Security-Policy', content: policy},
            injectTo: 'head-prepend',
        }],
    };
}

export default defineConfig(({mode}: ConfigEnv): UserConfig => ({
    server: {
        allowedHosts: ['ui-streamvibe.duckdns.org']
    },
    plugins: [
        yaml(),
        react(),
        tailwindcss(),
        contentSecurityPolicy(loadEnv(mode, __dirname, 'VITE_')['VITE_BACKEND_API_DOMAIN'] ?? ''),
    ],
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, 'src/app'),
            '@i18n': path.resolve(__dirname, 'src/i18n'),
            '@auth': path.resolve(__dirname, 'src/features/auth'),
            '@content': path.resolve(__dirname, 'src/features/Content'),
            '@layout': path.resolve(__dirname, 'src/features/layout'),
            '@shared': path.resolve(__dirname, 'src/shared'),
        },
    },

    esbuild: {
        target: 'es2022', // ou 'esnext'
    },

    build: {
        target: 'es2022', // garante compatibilidade com top-level await
        rollupOptions: {
            output: {
                // NOTA (nov/2026): as bibliotecas em pedaços separados (o pacote
                // único passou de 500 kB) e que o navegador guarda entre deploys.
                manualChunks: (id: string): string | undefined => {
                    if (!id.includes('node_modules')) return undefined;
                    if (/react-icons|lucide-react/.test(id)) return 'icons';
                    if (/[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
                    if (/i18next/.test(id)) return 'i18n';
                    return 'vendor';
                },
            },
        },
    }
}));
