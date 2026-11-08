// response of POST /api/login_check and POST /{locale}/api/token/refresh (no envelope)
//
// NOTA (nov/2026): o refresh_token saiu do corpo. Ele vem num cookie
// HttpOnly da API, que o navegador guarda e manda sozinho (com
// credentials: 'include'); o JavaScript não o vê.
export type LoginResponse = {
    token: string;
};

export type RefreshTokenResponse = LoginResponse;
