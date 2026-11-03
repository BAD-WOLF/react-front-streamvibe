// response of POST /api/login_check and POST /{locale}/api/token/refresh (no envelope)
export type LoginResponse = {
    token: string;
    refresh_token: string;
};

export type RefreshTokenResponse = LoginResponse;
