import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    EmailVerificationStatusResponse, ResendVerificationPayload, ResendVerificationResponse, ValidateEmailLinkResponse,
    VerifyEmailLinkParams, VerifyEmailResponse
} from '@shared/types/auth/index.ts';

/**
 * Send the confirmation email again (POST /{locale}/api/resend-verification).
 * email_sent false: no account uses this email (generic answer). 409: already verified.
 */
export async function resendVerificationService(locale: Locale, payload: ResendVerificationPayload): Promise<ApiResult<ResendVerificationResponse>> {
    return apiRequest<ResendVerificationResponse>(locale, '/resend-verification', {method: 'POST', body: payload});
}

/**
 * Check the confirmation link without verifying (GET /{locale}/api/verify/email/validate).
 * Same locale as the link: the signature covers the whole link.
 */
export async function validateVerificationLinkService(locale: Locale, params: VerifyEmailLinkParams, signal?: AbortSignal): Promise<ApiResult<ValidateEmailLinkResponse>> {
    return apiRequest<ValidateEmailLinkResponse>(locale, '/verify/email/validate', {query: params, signal});
}

/**
 * Verify the email with the link of the email (GET /{locale}/api/verify/email).
 * 400 invalid_verification_link_error: invalid, expired or tampered link.
 */
export async function verifyEmailService(locale: Locale, params: VerifyEmailLinkParams): Promise<ApiResult<VerifyEmailResponse>> {
    return apiRequest<VerifyEmailResponse>(locale, '/verify/email', {query: params});
}

/**
 * Has the account confirmed its email? (GET /{locale}/api/verify/email/status/{userId})
 * Meant for polling after the registration (user_id comes in its answer).
 */
export async function getVerificationStatusService(locale: Locale, userId: number, signal?: AbortSignal): Promise<ApiResult<EmailVerificationStatusResponse>> {
    return apiRequest<EmailVerificationStatusResponse>(locale, `/verify/email/status/${userId}`, {signal});
}
