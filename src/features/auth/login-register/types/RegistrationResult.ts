// What the registration leaves for the "check your email" screen.
export type RegistrationResult = {
    email: string;
    /** user_id of POST /register; null when the email could not be sent (503) */
    userId: number | null;
    /** message of the 503 email_delivery_error: the account exists, the email did not go */
    deliveryError: string | null;
};
