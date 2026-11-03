// payload of POST /api/login_check
export type LoginPayload = {
    email: string;
    password: string;
};

// payload of POST /{locale}/api/token/refresh
export type RefreshTokenPayload = {
    refresh_token: string;
};
