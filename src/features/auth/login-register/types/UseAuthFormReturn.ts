import type {AuthErrors} from "@auth/login-register/types/AuthErrors.ts";
import type {PasswordStrength} from "@auth/utils/passwordStrength.service.ts";
import type {FormEvent} from "react";

export interface UseAuthFormReturn {
    // states
    email: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
    errors: AuthErrors;
    /** the error the API answered with (message and, on validation, one line per field) */
    apiError: unknown;
    strength: PasswordStrength;
    showPassword: boolean;
    isLoading: boolean;
    // setters
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setAgreeTerms: (value: boolean) => void;
    setShowPassword: (value: boolean) => void;
    // handles
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}
