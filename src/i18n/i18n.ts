import {isLocale, type Locale, preferredLocale} from '@i18n/locales.ts';
import i18n, {type Resource, type ResourceLanguage} from 'i18next';
import {initReactI18next} from 'react-i18next';

type Catalog = Record<string, unknown>;

// Catálogos em translations/<namespace>.<locale>.(json|yaml|yml), gerados pelo `yarn i18n:extract`.
const modules: Record<string, Catalog> = import.meta.glob<Catalog>(
    '../../translations/**/*.{json,yaml,yml}',
    {eager: true, import: 'default'}
);

const resources: Resource = {};
const errors: Array<{ path: string; error: unknown }> = [];

for (const [path, catalog] of Object.entries(modules)) {
    try {
        const file: string = path.split('/').pop() ?? '';   // ex.: messages.pt_BR.json
        const [namespace, locale]: (string | undefined)[] = file.replace(/\.(json|ya?ml)$/i, '').split('.');
        // um arquivo sem idioma no nome (ex.: locales.json, a lista de idiomas) não é catálogo
        if (namespace === undefined || locale === undefined) continue;
        const perLocale: ResourceLanguage = (resources[locale] ??= {});
        perLocale[namespace] = {...(perLocale[namespace] as Catalog | undefined), ...catalog};
    } catch (error: unknown) {
        errors.push({path, error});
    }
}

const namespaces: string[] = Array.from(
    new Set(Object.values(resources).flatMap((perLocale: ResourceLanguage): string[] => Object.keys(perLocale)))
);

function initialLanguage(): Locale {
    const candidate: string | undefined = window.location.pathname.split('/')[1];
    return isLocale(candidate) ? candidate : preferredLocale();
}

// NOTA (nov/2026): keySeparator ' ' e nsSeparator false, iguais ao
// i18next-parser.config.cjs. Sem o nsSeparator, uma chave com ":" (ex.:
// "Strength:") virava nome de namespace e nunca era traduzida.
export const i18nReady: Promise<void> = i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLanguage(),
        fallbackLng: 'en',
        ns: namespaces.length > 0 ? namespaces : ['messages'],
        defaultNS: 'messages',
        keySeparator: ' ',
        nsSeparator: false,
        interpolation: {escapeValue: false},
        debug: false, // Use true for i18n debugging
    })
    .then((): void => undefined);

declare global {
    interface Window {
        __i18n?: {
            modules: Record<string, Catalog>;
            resources: Resource;
            i18n: typeof i18n;
            setLng: (lng: string) => Promise<void>;
            errors: typeof errors;
        };
    }
}

window.__i18n = {
    modules,
    resources,
    i18n,
    errors,
    setLng: async (lng: string): Promise<void> => {
        await i18n.changeLanguage(lng);
    },
};

export default i18n;
