import type {Role} from '@shared/auth/roles.ts';
import type {AuditAction} from '@shared/types/admin/auditAction.ts';

// NOTA (nov/2026): os filtros das listas da administração (query string da
// API e da URL do front; ausente = sem aquele filtro).

// query of GET /{locale}/api/admin/users
export type UserListFilters = {
    page?: number | undefined;
    /** Trecho do email (sem diferenciar maiúsculas) ou, só com dígitos, também o id. */
    search?: string | undefined;
    role?: Role | undefined;
    verified?: boolean | undefined;
    blocked?: boolean | undefined;
};

// query of GET /{locale}/api/admin/audit-log
export type AuditLogFilters = {
    page?: number | undefined;
    /** Só as entradas desta conta. */
    user_id?: number | undefined;
    action?: AuditAction | undefined;
};
