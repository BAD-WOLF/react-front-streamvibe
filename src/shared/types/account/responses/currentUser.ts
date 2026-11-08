import type {Role} from '@shared/auth/roles.ts';

// data of GET /{locale}/api/me
//
// NOTA (nov/2026): a rota nova da API (Account). Lida do banco a cada
// chamada: um email confirmado ou um papel trocado depois do login aparece na
// hora. Com a hierarquia de papéis, `roles` virou `role` (o papel da conta).
export type CurrentUserResponse = {
    id: number;
    email: string;
    role: Role;
    verified: boolean;
};
