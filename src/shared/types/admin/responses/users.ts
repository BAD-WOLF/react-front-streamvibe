import type {Role} from '@shared/auth/roles.ts';
import type {Pagination} from '@shared/types/api/envelope.ts';
import type {ResetRequestSummary} from '@shared/types/auth/index.ts';

// NOTA (nov/2026): a administração de contas (Admin, 🔒 ROLE_ADMIN). Datas em
// ISO 8601; null quando não há (a conta nunca entrou, não está bloqueada, ou
// foi criada antes de a data de criação ser registrada).

// an item of data.users of GET /{locale}/api/admin/users
export type AdminUserSummary = {
    id: number;
    email: string;
    /** O papel da conta (o mais alto), sem os herdados. */
    role: Role;
    verified: boolean;
    created_at: string | null;
    last_login_at: string | null;
    /** null = liberada. */
    blocked_at: string | null;
};

// data of GET /{locale}/api/admin/users
export type UserListResponse = Pagination & {
    users: AdminUserSummary[];
};

// data of GET /{locale}/api/admin/users/{userId}
export type UserDetailsResponse = AdminUserSummary & {
    blocked_reason: string | null;
    /** Sessões que ainda valem (uma por navegador em que a pessoa entrou). */
    active_sessions: number;
    /** Os pedidos de troca de senha ainda válidos (o mesmo formato de /reset-password/requests). */
    password_reset_requests: ResetRequestSummary[];
    /** O que QUEM PEDIU pode fazer: alterar esta conta, e com quais papéis. */
    can_manage: boolean;
    assignable_roles: Role[];
};

// data of POST /{locale}/api/admin/users/{userId}/verify
export type VerifyUserResponse = {
    user_id: number;
    verified: boolean;
};

// data of POST /{locale}/api/admin/users/{userId}/resend-verification
export type ResendUserVerificationResponse = {
    user_id: number;
    email_sent: boolean;
};

// data of POST /{locale}/api/admin/users/{userId}/block
export type BlockUserResponse = {
    user_id: number;
    blocked_at: string;
    revoked_sessions: number;
};

// data of POST /{locale}/api/admin/users/{userId}/unblock
export type UnblockUserResponse = {
    user_id: number;
    blocked_at: null;
};

// data of POST /{locale}/api/admin/users/{userId}/role
export type ChangeUserRoleResponse = {
    user_id: number;
    role: Role;
    previous_role: Role;
};

// data of DELETE /{locale}/api/admin/users/{userId}/sessions
export type RevokeUserSessionsResponse = {
    user_id: number;
    revoked_sessions: number;
};

// data of DELETE /{locale}/api/admin/users/{userId}
export type DeleteUserResponse = {
    user_id: number;
    revoked_sessions: number;
};
