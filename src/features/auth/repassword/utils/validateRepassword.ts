import type {RepasswordErrors} from "@auth/repassword/types/RepasswordErrors.ts";
import {RepasswordMode} from "@auth/repassword/types/RepasswordMode.ts";
import {validateEmail, validateNewPassword} from "@auth/utils/passwordRules.ts";
import type {TFunction} from "i18next";

export function validateRepasswordFields(
    mode: RepasswordMode,
    email: string,
    password: string,
    confirmPassword: string,
    t: TFunction
): RepasswordErrors {
    const errors: RepasswordErrors = {};

    // email validation only in Request
    if (mode === RepasswordMode.Request) {
        const emailError: string | null = validateEmail(email, t);
        if (emailError !== null) errors.email = emailError;
    }

    // the new password follows the same rules as the registration
    if (mode === RepasswordMode.Reset) {
        const passwordError: string | null = validateNewPassword(password, t);
        if (passwordError !== null) errors.password = passwordError;
        if (confirmPassword !== password) errors.confirmPassword = t("Passwords do not match.");
    }

    return errors;
}
