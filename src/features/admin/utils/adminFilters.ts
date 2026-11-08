import {isRole} from '@shared/auth/roles.ts';
import {type AuditLogFilters, isAuditAction, type UserListFilters} from '@shared/types/admin/index.ts';

// NOTA (nov/2026): os filtros das listas da administração ficam na URL
// (paths.adminUsers, paths.auditLog). Aqui eles são lidos de volta, valor a
// valor: um valor que a API recusaria (página 0, papel que não existe) vira
// "sem filtro", em vez de um erro na tela.

const MAX_ID_DIGITS: RegExp = /^\d{1,9}$/;

/** Um inteiro positivo da URL; qualquer outra coisa, undefined. */
function positiveInt(value: string | null): number | undefined {
    if (value === null || !MAX_ID_DIGITS.test(value)) return undefined;
    const parsed: number = Number(value);
    return parsed > 0 ? parsed : undefined;
}

function flag(value: string | null): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
}

export function readUserListFilters(params: URLSearchParams): UserListFilters {
    const role: string | null = params.get('role');
    const search: string = (params.get('search') ?? '').trim();

    return {
        page: positiveInt(params.get('page')) ?? 1,
        search: search !== '' ? search : undefined,
        role: isRole(role) ? role : undefined,
        verified: flag(params.get('verified')),
        blocked: flag(params.get('blocked')),
    };
}

export function readAuditLogFilters(params: URLSearchParams): AuditLogFilters {
    const action: string | null = params.get('action');

    return {
        page: positiveInt(params.get('page')) ?? 1,
        user_id: positiveInt(params.get('user_id')),
        action: isAuditAction(action) ? action : undefined,
    };
}
