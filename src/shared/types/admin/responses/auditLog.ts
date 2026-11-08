import type {AuditAction} from '@shared/types/admin/auditAction.ts';
import type {Pagination} from '@shared/types/api/envelope.ts';

// NOTA (nov/2026): o log de auditoria da administração de contas.

/** Uma conta numa entrada: o id e o email no momento da ação (ficam mesmo depois de a conta ser excluída). */
export type AuditLogAccount = {
    id: number;
    email: string;
};

// an item of data.entries of GET /{locale}/api/admin/audit-log
export type AuditLogEntry = {
    id: number;
    action: AuditAction;
    occurred_at: string;
    /** Quem fez; null = pelo console (acesso ao servidor). */
    actor: AuditLogAccount | null;
    target: AuditLogAccount | null;
    /** Sempre traz `role` (o papel da conta depois da ação); o resto depende da ação. */
    details: Record<string, string | number | boolean | null>;
};

// data of GET /{locale}/api/admin/audit-log
export type AuditLogResponse = Pagination & {
    entries: AuditLogEntry[];
};
