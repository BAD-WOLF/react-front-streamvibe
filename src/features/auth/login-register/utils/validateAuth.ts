import type {AuthErrors} from "@auth/login-register/types/AuthErrors.ts";
import {AuthMode} from "@auth/login-register/types/AuthMode.ts";
import {validateEmail, validateNewPassword} from "@auth/utils/passwordRules.ts";
import type {TFunction} from "i18next";

export function validateAuth(
    email: string,
    password: string,
    confirmPassword: string,
    agreeTerms: boolean,
    mode: AuthMode,
    t: TFunction
): AuthErrors {
    const errors: AuthErrors = {};

    const emailError: string | null = validateEmail(email, t);
    if (emailError !== null) errors.email = emailError;

    if (mode === AuthMode.Login) {
        // no login, só não pode estar vazia: contas antigas podem ter senhas de outra regra
        if (password === "") errors.password = t("Password is required.");
        return errors;
    }

    const passwordError: string | null = validateNewPassword(password, t);
    if (passwordError !== null) errors.password = passwordError;
    if (confirmPassword !== password) errors.confirmPassword = t("Passwords do not match.");
    if (!agreeTerms) errors.agreeTerms = t("You must agree to the terms of use.");

    return errors;
}
