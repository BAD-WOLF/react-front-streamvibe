// payload of POST /{locale}/api/register
export type RegisterPayload = {
    email: string;
    password: string;
    // NOTA (nov/2026): a API exige o aceite dos termos (true); sem ele, 400.
    agreeTerms: boolean;
};
