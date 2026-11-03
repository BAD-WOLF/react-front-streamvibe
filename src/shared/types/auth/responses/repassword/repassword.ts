// data of POST /{locale}/api/reset-password
// email_sent true: link sent; false with expires_at: a valid link was already sent;
// false without expires_at: generic answer (no account with this email).
export type RepasswordRequestResponse = {
    email_sent: boolean;
    expires_at: string | null;
};

// data of GET /{locale}/api/reset-password/status/{token}
export type RepasswordStatusResponse = {
    valid: boolean;
    expired: boolean;
    used: boolean;
    expires_at: string;
};

// data of POST /{locale}/api/reset-password/confirm
export type RepasswordConfirmResponse = {
    password_reset: boolean;
};

// data of POST /{locale}/api/reset-password/cancel
export type RepasswordCancelResponse = {
    cancelled: boolean;
};

// data of GET /{locale}/api/reset-password/requests/{userId}
export type ResetRequestSummary = {
    id: number;
    created_at: string;
    expires_at: string;
};

export type UserResetRequestsResponse = {
    user_id: number;
    active_requests: ResetRequestSummary[];
};
