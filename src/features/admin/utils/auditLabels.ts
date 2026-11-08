import type {Translation} from '@i18n/translation.ts';
import {roleLabel} from '@shared/auth/roleLabels.ts';
import {isRole} from '@shared/auth/roles.ts';
import {AuditAction} from '@shared/types/admin/index.ts';

// NOTA (nov/2026): os textos do log de auditoria: o nome de cada ação e de
// cada campo dos detalhes (a API manda os nomes técnicos).

export function auditActionLabel(t: Translation['t'], action: AuditAction): string {
    switch (action) {
        case AuditAction.UserVerified:
            return t('Manual email confirmation');
        case AuditAction.VerificationResent:
            return t('Confirmation email sent again');
        case AuditAction.UserBlocked:
            return t('Account blocked');
        case AuditAction.UserUnblocked:
            return t('Account unblocked');
        case AuditAction.RoleChanged:
            return t('Role changed');
        case AuditAction.SessionsRevoked:
            return t('Sessions ended');
        case AuditAction.UserDeleted:
            return t('Account deleted');
    }
}

function detailLabel(t: Translation['t'], key: string): string {
    switch (key) {
        case 'role':
            return t('Account role');
        case 'previous_role':
            return t('Former role');
        case 'reason':
            return t('Block reason');
        case 'previous_reason':
            return t('Former reason');
        case 'revoked_sessions':
            return t('Sessions ended');
        default:
            return key;
    }
}

function detailValue(t: Translation['t'], value: string | number | boolean | null): string {
    if (value === null) return '—';
    if (isRole(value)) return roleLabel(t, value);
    return String(value);
}

/** Os detalhes de uma entrada, uma linha por campo ("Papel da conta: Administrador"). */
export function auditDetailLines(t: Translation['t'], details: Record<string, string | number | boolean | null>): string[] {
    return Object.entries(details).map(
        ([key, value]: [string, string | number | boolean | null]): string => `${detailLabel(t, key)}: ${detailValue(t, value)}`,
    );
}
