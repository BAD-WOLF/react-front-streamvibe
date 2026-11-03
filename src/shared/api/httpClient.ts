import i18n from '@i18n/i18n.ts';
import type {Locale} from '@i18n/locales.ts';
import {absoluteUrl, localizedPath} from '@shared/api/apiConfig.ts';
import {ApiError, ApiErrorType, isEnvelopeError, isLexikError, toApiAction, toApiErrorType} from '@shared/api/ApiError.ts';
import {clearTokens, decodeClaims, isTokenExpired, type JwtClaims, readTokens, saveTokens, type SessionTokens} from '@shared/auth/tokenStorage.ts';
import type {ApiErrorDetails, ApiResult, ApiSuccessBody} from '@shared/types/api/envelope.ts';
import type {RefreshTokenPayload, RefreshTokenResponse} from '@shared/types/auth/index.ts';

export type QueryValue = string | number | boolean | null | undefined;

export type Query = Record<string, QueryValue>;

// NOTA (nov/2026): com o exactOptionalPropertyTypes, um campo opcional só
// aceita `undefined` explícito se o tipo disser. Os services repassam o
// `signal` (e a `query`) que receberam, que podem ser undefined.
export type RequestOptions = {
    method?: 'GET' | 'POST' | undefined;
    query?: Query | undefined;
    body?: unknown;
    /** Rota 🔒: manda o JWT e, num 401, renova com o refresh token e tenta de novo. */
    auth?: boolean | undefined;
    signal?: AbortSignal | undefined;
};

function buildUrl(path: string, query?: Query): string {
    const params: URLSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value === undefined || value === null || value === '') continue;
        params.set(key, String(value));
    }
    const search: string = params.toString();
    return absoluteUrl(path) + (search !== '' ? `?${search}` : '');
}

function fallbackMessage(status: number): string {
    if (status === 401) return i18n.t('Your session has expired. Please log in again.');
    if (status === 404) return i18n.t('Not found.');
    if (status === 429) return i18n.t('Too many requests. Please wait a moment and try again.');
    if (status >= 500) return i18n.t('The server is unavailable right now. Please try again later.');
    return i18n.t('Unexpected error. Please try again later.');
}

async function toApiError(response: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (isEnvelopeError(body)) {
        const {type, message, errors, action_required}: ApiErrorDetails = body.error;
        return new ApiError(response.status, toApiErrorType(type), message, errors ?? [], toApiAction(action_required));
    }
    if (isLexikError(body)) {
        const type: ApiErrorType = response.status === 401 ? ApiErrorType.Unauthorized : ApiErrorType.Http;
        return new ApiError(response.status, type, body.message);
    }
    return new ApiError(response.status, ApiErrorType.Http, fallbackMessage(response.status));
}

async function performRefresh(locale: Locale): Promise<string | null> {
    const tokens: SessionTokens | null = readTokens();
    if (tokens === null) return null;

    const payload: RefreshTokenPayload = {refresh_token: tokens.refreshToken};
    let response: Response;
    try {
        response = await fetch(buildUrl(localizedPath(locale, '/token/refresh')), {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Accept: 'application/json'},
            body: JSON.stringify(payload),
        });
    } catch {
        return null; // sem rede: mantém a sessão; a chamada original falha com erro de rede
    }

    if (!response.ok) {
        clearTokens(); // refresh vencido ou revogado (a troca de senha revoga todos)
        return null;
    }

    const renewed: RefreshTokenResponse = await response.json() as RefreshTokenResponse;
    saveTokens({token: renewed.token, refreshToken: renewed.refresh_token});
    return renewed.token;
}

let refreshing: Promise<string | null> | null = null;

// NOTA (nov/2026): uma renovação por vez; as chamadas que chegam durante ela
// esperam o mesmo resultado, em vez de gastar o refresh token várias vezes.
function refreshAccessToken(locale: Locale): Promise<string | null> {
    refreshing ??= performRefresh(locale).finally((): void => {
        refreshing = null;
    });
    return refreshing;
}

async function currentAccessToken(locale: Locale): Promise<string | null> {
    const tokens: SessionTokens | null = readTokens();
    if (tokens === null) return null;
    const claims: JwtClaims | null = decodeClaims(tokens.token);
    if (claims !== null && !isTokenExpired(claims)) return tokens.token;
    return refreshAccessToken(locale);
}

async function send(path: string, options: RequestOptions, accept: string, locale: Locale | null): Promise<Response> {
    const perform: (token: string | null) => Promise<Response> = async (token: string | null): Promise<Response> => {
        const headers: Headers = new Headers({Accept: accept});
        if (options.body !== undefined) headers.set('Content-Type', 'application/json');
        if (token !== null) headers.set('Authorization', `Bearer ${token}`);

        try {
            return await fetch(buildUrl(path, options.query), {
                method: options.method ?? 'GET',
                headers,
                body: options.body !== undefined ? JSON.stringify(options.body) : null,
                signal: options.signal ?? null,
            });
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            throw new ApiError(0, ApiErrorType.Network, i18n.t('Could not reach the server. Check your connection and try again.'));
        }
    };

    if (options.auth !== true || locale === null) return perform(null);

    const response: Response = await perform(await currentAccessToken(locale));
    if (response.status !== 401) return response;

    const renewed: string | null = await refreshAccessToken(locale);
    return renewed !== null ? perform(renewed) : response;
}

/** Rota /{locale}/api/...: devolve o `data` e a `message` do envelope. */
export async function apiRequest<T>(locale: Locale, path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const response: Response = await send(localizedPath(locale, path), options, 'application/json', locale);
    if (!response.ok) throw await toApiError(response);

    const body: ApiSuccessBody<T> = await response.json() as ApiSuccessBody<T>;
    return {data: body.data, message: body.message ?? null};
}

/** Rota /{locale}/api/... que devolve a imagem em si (format=binary). */
export async function apiRequestBlob(locale: Locale, path: string, options: RequestOptions = {}): Promise<Blob> {
    const response: Response = await send(localizedPath(locale, path), options, 'image/*, application/json', locale);
    if (!response.ok) throw await toApiError(response);
    return response.blob();
}

/** Rota fora do envelope e sem JWT (POST /api/login_check, GET /health). */
export async function rawRequest<T>(path: string, options: Omit<RequestOptions, 'auth'> = {}): Promise<T> {
    const response: Response = await send(path, options, 'application/json', null);
    if (!response.ok) throw await toApiError(response);
    return await response.json() as T;
}
