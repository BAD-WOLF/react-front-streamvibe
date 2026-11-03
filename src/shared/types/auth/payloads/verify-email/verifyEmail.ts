// payload of POST /{locale}/api/resend-verification
export type ResendVerificationPayload = {
    email: string;
};

// query of GET /{locale}/api/verify/email and /verify/email/validate:
// the parameters of the signed link, exactly as they came in the email.
export type VerifyEmailLinkParams = {
    expires: string;
    id: string;
    signature: string;
    token: string;
};
