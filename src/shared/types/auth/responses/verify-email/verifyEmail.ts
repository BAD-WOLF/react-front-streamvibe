// data of POST /{locale}/api/resend-verification
export type ResendVerificationResponse = {
    email_sent: boolean;
};

// data of GET /{locale}/api/verify/email
export type VerifyEmailResponse = {
    user_id: number;
    already_verified: boolean;
    verified: boolean;
};

// data of GET /{locale}/api/verify/email/validate
export type ValidateEmailLinkResponse = {
    user_id: number;
    valid: boolean;
    already_verified: boolean;
};

// data of GET /{locale}/api/verify/email/status/{userId}
export type EmailVerificationStatusResponse = {
    user_id: number;
    verified: boolean;
};
