import type {Role} from '@shared/auth/roles.ts';

// NOTA (nov/2026): os corpos das ações da administração de contas.

// body of POST /{locale}/api/admin/users/{userId}/block
export type BlockUserPayload = {
    /** Obrigatório, até 255 caracteres: fica na conta e no log. */
    reason: string;
};

// body of POST /{locale}/api/admin/users/{userId}/role
export type ChangeUserRolePayload = {
    role: Role;
};
