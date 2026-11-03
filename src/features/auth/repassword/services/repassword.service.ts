import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    RepasswordCancelPayload, RepasswordCancelResponse, RepasswordConfirmPayload, RepasswordConfirmResponse,
    RepasswordRequestPayload, RepasswordRequestResponse, RepasswordStatusResponse, UserResetRequestsResponse
} from '@shared/types/auth/index.ts';

/**
 * Send the email with the reset link (POST /{locale}/api/reset-password).
 * 403: account not verified; 429: a link was requested moments ago; 503: email not sent.
 */
export async function requestPasswordReset(locale: Locale, payload: RepasswordRequestPayload): Promise<ApiResult<RepasswordRequestResponse>> {
    return apiRequest<RepasswordRequestResponse>(locale, '/reset-password', {method: 'POST', body: payload});
}

/**
 * Can the token of the link still be used? (GET /{locale}/api/reset-password/status/{token})
 * 400: invalid, cancelled or used token; 410: expired token.
 */
export async function getResetPasswordStatus(locale: Locale, token: string, signal?: AbortSignal): Promise<ApiResult<RepasswordStatusResponse>> {
    return apiRequest<RepasswordStatusResponse>(locale, `/reset-password/status/${encodeURIComponent(token)}`, {signal});
}

/**
 * Set the new password (POST /{locale}/api/reset-password/confirm).
 * Every refresh token of the user is revoked: other sessions log in again.
 */
export async function confirmPasswordReset(locale: Locale, payload: RepasswordConfirmPayload): Promise<ApiResult<RepasswordConfirmResponse>> {
    return apiRequest<RepasswordConfirmResponse>(locale, '/reset-password/confirm', {method: 'POST', body: payload});
}

/**
 * "I did not ask for this": the link stops working (POST /{locale}/api/reset-password/cancel).
 * 404: no valid request for this token.
 */
export async function cancelPasswordReset(locale: Locale, payload: RepasswordCancelPayload): Promise<ApiResult<RepasswordCancelResponse>> {
    return apiRequest<RepasswordCancelResponse>(locale, '/reset-password/cancel', {method: 'POST', body: payload});
}

/**
 * Active reset requests of a user (GET /{locale}/api/reset-password/requests/{userId}, 🔒).
 * Only the user and ROLE_ADMIN can list them (403 otherwise).
 */
export async function getUserResetRequests(locale: Locale, userId: number, signal?: AbortSignal): Promise<ApiResult<UserResetRequestsResponse>> {
    return apiRequest<UserResetRequestsResponse>(locale, `/reset-password/requests/${userId}`, {auth: true, signal});
}
