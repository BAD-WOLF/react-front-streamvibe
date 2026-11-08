import type {Locale} from '@i18n/locales.ts';
import {apiRequest, rawRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {LoginPayload, LoginResponse, RegisterPayload, RegisterResponse} from '@shared/types/auth/index.ts';

/**
 * Perform user login and receive the JWT (the access token).
 * POST /api/login_check (no locale prefix, no envelope). 401: invalid
 * credentials or account whose email was not confirmed yet; 429: too many
 * wrong passwords from this IP (Retry-After says how long to wait).
 *
 * NOTA (nov/2026): com credentials: 'include' (withCredentials), para o
 * navegador aceitar o cookie HttpOnly do refresh token que vem na resposta.
 */
export async function loginService(payload: LoginPayload): Promise<LoginResponse> {
    return rawRequest<LoginResponse>('/api/login_check', {method: 'POST', body: payload, withCredentials: true});
}

/**
 * Register a new user (201) and send the confirmation email.
 * POST /{locale}/api/register. 409: email of an account already verified;
 * 503: account created, but the email could not be sent.
 */
export async function registerService(locale: Locale, payload: RegisterPayload): Promise<ApiResult<RegisterResponse>> {
    return apiRequest<RegisterResponse>(locale, '/register', {method: 'POST', body: payload});
}

// NOTA (nov/2026): o refresh do JWT (POST /{locale}/api/token/refresh) e o
// logout (POST /{locale}/api/logout) ficam em shared/auth/session.service.ts:
// a sessão é de todas as telas, não só do login.
