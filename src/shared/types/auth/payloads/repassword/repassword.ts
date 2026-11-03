// payload of POST /{locale}/api/reset-password
export type RepasswordRequestPayload = {
    email: string;
};

// payload of POST /{locale}/api/reset-password/confirm
export type RepasswordConfirmPayload = {
    token: string;
    password: string;
};

// payload of POST /{locale}/api/reset-password/cancel
export type RepasswordCancelPayload = {
    token: string;
};
