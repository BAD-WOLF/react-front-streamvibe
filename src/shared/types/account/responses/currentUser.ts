// data of GET /{locale}/api/me
//
// NOTA (nov/2026): a rota nova da API (Account). Lida do banco a cada
// chamada: um email confirmado ou um papel trocado depois do login aparece na
// hora. `roles` sempre traz ROLE_USER.
export type CurrentUserResponse = {
    id: number;
    email: string;
    roles: string[];
    verified: boolean;
};
