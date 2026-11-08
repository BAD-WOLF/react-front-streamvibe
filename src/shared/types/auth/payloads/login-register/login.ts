// payload of POST /api/login_check
//
// NOTA (nov/2026): o POST /{locale}/api/token/refresh não tem mais corpo: o
// refresh token vai no cookie (o RefreshTokenPayload saiu).
export type LoginPayload = {
    email: string;
    password: string;
};
