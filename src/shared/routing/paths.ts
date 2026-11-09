import type {Locale} from '@i18n/locales.ts';
import type {AuditLogFilters, UserListFilters} from '@shared/types/admin/index.ts';
import type {MovieListName, TrendingTimeWindow} from '@shared/types/movie/index.ts';
import {DEFAULT_LOG_LIMIT, type SystemQuery, SystemTab} from '@shared/types/system/index.ts';

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

/**
 * NOTA (nov/2026): o que o detalhe de uma conta manda para a lista depois de
 * excluí-la (o email, para o aviso), no state da navegação — como o
 * AuthLocationState.
 */
export type AdminUsersLocationState = {
    deleted?: string | undefined;
};

export function readAdminUsersLocationState(state: unknown): AdminUsersLocationState {
    if (typeof state !== 'object' || state === null) return {};
    const candidate: Record<string, unknown> = state as Record<string, unknown>;
    return {deleted: typeof candidate['deleted'] === 'string' ? candidate['deleted'] : undefined};
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
    adminUsers: (locale: Locale, query?: UserListFilters) => string;
    adminUser: (locale: Locale, userId: number) => string;
    auditLog: (locale: Locale, query?: AuditLogFilters) => string;
    system: (locale: Locale, query?: SystemQuery) => string;
};

/** true/false da query; undefined (sem filtro) fica fora da URL. */
function flag(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : String(value);
}

/** A página na URL só a partir da 2. */
function pageParam(page: number | undefined): number | undefined {
    return page !== undefined && page > 1 ? page : undefined;
}

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
    // NOTA (nov/2026): a administração de contas (ROLE_ADMIN). Os filtros
    // ficam na URL: a lista filtrada pode ser recarregada e compartilhada.
    adminUsers: (locale: Locale, query: UserListFilters = {}): string => withQuery(`/${locale}/admin/users`, {
        page: pageParam(query.page),
        search: query.search?.trim(),
        role: query.role,
        verified: flag(query.verified),
        blocked: flag(query.blocked),
    }),
    adminUser: (locale: Locale, userId: number): string => `/${locale}/admin/users/${userId}`,
    auditLog: (locale: Locale, query: AuditLogFilters = {}): string => withQuery(`/${locale}/admin/audit-log`, {
        page: pageParam(query.page),
        user_id: query.user_id,
        action: query.action,
    }),
    // NOTA (nov/2026): o painel do sistema (ROLE_DEV). A aba e os filtros dos
    // logs na URL; o que é padrão (a aba Servidor, 200 linhas) fica de fora.
    system: (locale: Locale, query: SystemQuery = {}): string => withQuery(`/${locale}/system`, {
        tab: query.tab === SystemTab.Server ? undefined : query.tab,
        file: query.file,
        level: query.level,
        search: query.search?.trim(),
        limit: query.limit === DEFAULT_LOG_LIMIT ? undefined : query.limit,
    }),
};

/** O mesmo endereço em outro idioma: troca o primeiro segmento. */
export function switchLocalePath(pathname: string, search: string, locale: Locale): string {
    const segments: string[] = pathname.split('/');
    segments[1] = locale;
    return `${segments.join('/')}${search}`;
}
