import type {Locale} from '@i18n/locales.ts';
import type {MovieListName, TrendingTimeWindow} from '@shared/types/movie/index.ts';

type QueryParams = Record<string, string | number | undefined>;

const MAX_PAGE: number = 500;

/** O ?page= da URL, de 1 a 500 (o limite do TMDB); vazio ou inválido vira 1. */
export function pageFromQuery(value: string | null): number {
    const parsed: number = Number(value);
    const page: number = Number.isNaN(parsed) || parsed === 0 ? 1 : parsed;
    return Math.min(Math.max(page, 1), MAX_PAGE);
}

function withQuery(path: string, query: QueryParams): string {
    const params: URLSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const search: string = params.toString();
    return search !== '' ? `${path}?${search}` : path;
}

export type AuthQuery = {
    mode?: 'register' | undefined;
};

/**
 * NOTA (nov/2026): o que o login e a troca de senha recebem de quem manda
 * para lá — para onde voltar depois do login (next) e o email já digitado —
 * vai no state da navegação, e não mais na query (?next=, ?email=). O
 * endereço fica limpo, o email não aparece na URL (nem no histórico, nem nos
 * logs de um servidor ou proxy), e um link de fora não escolhe para onde o
 * login manda a pessoa.
 */
export type AuthLocationState = {
    next?: string | undefined;
    email?: string | undefined;
};

/** O state que chegou com a navegação, conferido campo a campo (o histórico pode trazer qualquer coisa). */
export function readAuthLocationState(state: unknown): AuthLocationState {
    if (typeof state !== 'object' || state === null) return {};
    const candidate: Record<string, unknown> = state as Record<string, unknown>;
    return {
        next: typeof candidate['next'] === 'string' ? candidate['next'] : undefined,
        email: typeof candidate['email'] === 'string' ? candidate['email'] : undefined,
    };
}

export type MovieListQuery = {
    window?: TrendingTimeWindow | undefined;
    page?: number | undefined;
};

export type AppPaths = {
    home: (locale: Locale) => string;
    auth: (locale: Locale, query?: AuthQuery) => string;
    verifyEmail: (locale: Locale) => string;
    repassword: (locale: Locale) => string;
    repasswordToken: (locale: Locale, token: string) => string;
    account: (locale: Locale) => string;
    movieList: (locale: Locale, list: MovieListName, query?: MovieListQuery) => string;
    search: (locale: Locale, query?: string) => string;
    movie: (locale: Locale, movieId: number) => string;
    person: (locale: Locale, personId: number) => string;
};

// NOTA (nov/2026): todas as rotas do front num lugar só, sempre com o idioma
// na frente (/pt_BR/...). Os links da API que chegam sem idioma (ex.: o email
// de troca de senha, /auth/repassword/{token}) são completados pelo LocaleLayout.
export const paths: AppPaths = {
    home: (locale: Locale): string => `/${locale}/home`,
    auth: (locale: Locale, query: AuthQuery = {}): string =>
        withQuery(`/${locale}/auth`, query),
    verifyEmail: (locale: Locale): string => `/${locale}/auth/verify-email`,
    repassword: (locale: Locale): string => `/${locale}/auth/repassword`,
    repasswordToken: (locale: Locale, token: string): string => `/${locale}/auth/repassword/${encodeURIComponent(token)}`,
    account: (locale: Locale): string => `/${locale}/account`,
    movieList: (locale: Locale, list: MovieListName, query: MovieListQuery = {}): string =>
        withQuery(`/${locale}/movies/list/${list}`, {window: query.window, page: query.page !== undefined && query.page > 1 ? query.page : undefined}),
    search: (locale: Locale, query: string = ''): string => withQuery(`/${locale}/movies/search`, {q: query.trim()}),
    movie: (locale: Locale, movieId: number): string => `/${locale}/movies/${movieId}`,
    person: (locale: Locale, personId: number): string => `/${locale}/person/${personId}`,
};

/** O mesmo endereço em outro idioma: troca o primeiro segmento. */
export function switchLocalePath(pathname: string, search: string, locale: Locale): string {
    const segments: string[] = pathname.split('/');
    segments[1] = locale;
    return `${segments.join('/')}${search}`;
}
