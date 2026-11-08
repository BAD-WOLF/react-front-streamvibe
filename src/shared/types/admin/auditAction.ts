// NOTA (nov/2026): o que uma entrada do log de auditoria registra. Espelho do
// App\Domain\Audit\ValueObject\AuditAction da API (os mesmos valores).
export enum AuditAction {
    UserVerified = 'user_verified',
    VerificationResent = 'verification_resent',
    UserBlocked = 'user_blocked',
    UserUnblocked = 'user_unblocked',
    RoleChanged = 'role_changed',
    SessionsRevoked = 'sessions_revoked',
    UserDeleted = 'user_deleted',
}

export const AUDIT_ACTIONS: readonly AuditAction[] = Object.values(AuditAction);

const ACTION_NAMES: readonly string[] = AUDIT_ACTIONS;

export function isAuditAction(value: unknown): value is AuditAction {
    return typeof value === 'string' && ACTION_NAMES.includes(value);
}
