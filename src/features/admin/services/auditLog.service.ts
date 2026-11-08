import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {AuditLogFilters, AuditLogResponse} from '@shared/types/admin/index.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';

/**
 * A page of the audit log (GET /{locale}/api/admin/audit-log 🔒 ROLE_ADMIN),
 * newest first (20 per page): who did what to which account, and when.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export async function listAuditLog(locale: Locale, filters: AuditLogFilters, signal?: AbortSignal): Promise<ApiResult<AuditLogResponse>> {
    return apiRequest<AuditLogResponse>(locale, '/admin/audit-log', {
        auth: true,
        query: {page: filters.page, user_id: filters.user_id, action: filters.action},
        signal,
    });
}
