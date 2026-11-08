import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {
    BlockUserPayload, BlockUserResponse, ChangeUserRolePayload, ChangeUserRoleResponse, DeleteUserResponse, ResendUserVerificationResponse,
    RevokeUserSessionsResponse, UnblockUserResponse, UserDetailsResponse, UserListFilters, UserListResponse, VerifyUserResponse
} from '@shared/types/admin/index.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';

// NOTA (nov/2026): a administração de contas da API (/{locale}/api/admin/users,
// 🔒 ROLE_ADMIN). Quem pode alterar qual conta é regra da API: um admin só
// mexe nas contas abaixo do papel dele, e ninguém na própria (403). O
// detalhe da conta diz o que é permitido (can_manage, assignable_roles).

const users: string = '/admin/users';

/** A page of accounts, newest first (20 per page), with the filters that are set. */
export async function listUsers(locale: Locale, filters: UserListFilters, signal?: AbortSignal): Promise<ApiResult<UserListResponse>> {
    return apiRequest<UserListResponse>(locale, users, {
        auth: true,
        query: {page: filters.page, search: filters.search, role: filters.role, verified: filters.verified, blocked: filters.blocked},
        signal,
    });
}

/** Everything about an account, and what the logged-in admin can do with it. */
export async function getUserDetails(locale: Locale, userId: number, signal?: AbortSignal): Promise<ApiResult<UserDetailsResponse>> {
    return apiRequest<UserDetailsResponse>(locale, `${users}/${userId}`, {auth: true, signal});
}

/** Confirms the email in place of its owner (409 when it is already confirmed). */
export async function verifyUser(locale: Locale, userId: number): Promise<ApiResult<VerifyUserResponse>> {
    return apiRequest<VerifyUserResponse>(locale, `${users}/${userId}/verify`, {method: 'POST', auth: true});
}

/** Sends the email confirmation again (409 when it is already confirmed; 503 when the email fails). */
export async function resendUserVerification(locale: Locale, userId: number): Promise<ApiResult<ResendUserVerificationResponse>> {
    return apiRequest<ResendUserVerificationResponse>(locale, `${users}/${userId}/resend-verification`, {method: 'POST', auth: true});
}

/** Blocks the account and ends its sessions (409 when it is already blocked, or it is the last active owner). */
export async function blockUser(locale: Locale, userId: number, payload: BlockUserPayload): Promise<ApiResult<BlockUserResponse>> {
    return apiRequest<BlockUserResponse>(locale, `${users}/${userId}/block`, {method: 'POST', auth: true, body: payload});
}

/** The account can log in again (409 when it is not blocked). */
export async function unblockUser(locale: Locale, userId: number): Promise<ApiResult<UnblockUserResponse>> {
    return apiRequest<UnblockUserResponse>(locale, `${users}/${userId}/unblock`, {method: 'POST', auth: true});
}

/** Gives another role (one of assignable_roles; 409 when it is the same, or it is the last active owner). */
export async function changeUserRole(locale: Locale, userId: number, payload: ChangeUserRolePayload): Promise<ApiResult<ChangeUserRoleResponse>> {
    return apiRequest<ChangeUserRoleResponse>(locale, `${users}/${userId}/role`, {method: 'POST', auth: true, body: payload});
}

/** Ends the sessions of the account in every browser. */
export async function revokeUserSessions(locale: Locale, userId: number): Promise<ApiResult<RevokeUserSessionsResponse>> {
    return apiRequest<RevokeUserSessionsResponse>(locale, `${users}/${userId}/sessions`, {method: 'DELETE', auth: true});
}

/** Deletes the account, its password reset requests and its sessions (the audit log keeps its entries). */
export async function deleteUser(locale: Locale, userId: number): Promise<ApiResult<DeleteUserResponse>> {
    return apiRequest<DeleteUserResponse>(locale, `${users}/${userId}`, {method: 'DELETE', auth: true});
}
