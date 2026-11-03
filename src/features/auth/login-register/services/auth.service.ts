import type {Locale} from '@i18n/locales.ts';
import {apiRequest, rawRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {LoginPayload, LoginResponse, RegisterPayload, RegisterResponse} from '@shared/types/auth/index.ts';

/**
 * Perform user login and receive JWT + refresh token.
 * POST /api/login_check (no locale prefix, no envelope). 401: invalid
 * credentials or account whose email was not confirmed yet.
 */
export async function loginService(payload: LoginPayload): Promise<LoginResponse> {
    return rawRequest<LoginResponse>('/api/login_check', {method: 'POST', body: payload});
}

/**
 * Register a new user (201) and send the confirmation email.
 * POST /{locale}/api/register. 409: email of an account already verified;
 * 503: account created, but the email could not be sent.
 */
export async function registerService(locale: Locale, payload: RegisterPayload): Promise<ApiResult<RegisterResponse>> {
    return apiRequest<RegisterResponse>(locale, '/register', {method: 'POST', body: payload});
}

// NOTA (nov/2026): o refresh do JWT (POST /{locale}/api/token/refresh) saiu
// daqui: ele é feito pelo httpClient, sozinho, quando uma rota 🔒 dá 401.
