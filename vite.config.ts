import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import tailwindcss from "@tailwindcss/vite";
import yaml from '@modyfi/vite-plugin-yaml';
import {fileURLToPath} from "url";

const __filename:string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export default defineConfig({
    server: {
        allowedHosts: ['ui-streamvibe.duckdns.org']
    },
    plugins: [
        yaml(),
        react(),
        tailwindcss(),
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
});
