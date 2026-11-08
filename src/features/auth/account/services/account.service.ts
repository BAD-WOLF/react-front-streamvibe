import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {CurrentUserResponse} from '@shared/types/account/index.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';

/**
 * The account of the logged-in user (GET /{locale}/api/me 🔒), read from the
 * database on every call.
 *
 * NOTA (nov/2026): a rota nova da API. Antes, o front só sabia o id da conta
 * se o cadastro tivesse sido feito naquele navegador.
 */
export async function getCurrentUser(locale: Locale, signal?: AbortSignal): Promise<ApiResult<CurrentUserResponse>> {
    return apiRequest<CurrentUserResponse>(locale, '/me', {auth: true, signal});
}
