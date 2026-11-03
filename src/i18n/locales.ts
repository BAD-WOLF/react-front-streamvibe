// NOTA (nov/2026): os idiomas são os do prefixo {_locale} da API (en, pt_BR e
// es; qualquer outro dá 404 lá). A URL do front carrega o mesmo prefixo, e
// dele saem o idioma da interface e o `language` do conteúdo do TMDB.
export const SUPPORTED_LOCALES: readonly ['pt_BR', 'en', 'es'] = ['pt_BR', 'en', 'es'];

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pt_BR';

const LOCALE_STORAGE_KEY: string = 'locale';

// BCP 47: o `language` que a API repassa ao TMDB e o idioma do Intl.
const LANGUAGE_TAGS: Record<Locale, string> = {
    pt_BR: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
};

export const LOCALE_LABELS: Record<Locale, string> = {
    pt_BR: 'Português',
    en: 'English',
    es: 'Español',
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function toLanguageTag(locale: Locale): string {
    return LANGUAGE_TAGS[locale];
}

export function rememberLocale(locale: Locale): void {
    try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
        // storage indisponível (modo privado): só não lembra a escolha
    }
}

/** O último idioma escolhido, senão o do navegador, senão o padrão do projeto. */
export function preferredLocale(): Locale {
    try {
        const stored: string | null = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (isLocale(stored)) return stored;
    } catch {
        // storage indisponível: segue para o idioma do navegador
    }

    for (const language of navigator.languages) {
        const normalized: string = language.toLowerCase();
        if (normalized.startsWith('pt')) return 'pt_BR';
        if (normalized.startsWith('es')) return 'es';
        if (normalized.startsWith('en')) return 'en';
    }

    return DEFAULT_LOCALE;
}
