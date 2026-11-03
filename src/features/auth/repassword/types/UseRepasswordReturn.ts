import type {RepasswordErrors} from "@auth/repassword/types/RepasswordErrors.ts";
import type {RepasswordMode} from "@auth/repassword/types/RepasswordMode.ts";
import type {PasswordStrength} from "@auth/utils/passwordStrength.service.ts";
import type {RepasswordRequestResponse} from "@shared/types/auth/index.ts";
import type {FormEvent} from "react";

export type UseRepasswordReturn = {
    mode: RepasswordMode;
    email: string;
    password: string;
    strength: PasswordStrength;
    confirmPassword: string;
    errors: RepasswordErrors;
    /** the error the API answered with */
    apiError: unknown;
    /** answer of POST /reset-password */
    requestResult: RepasswordRequestResponse | null;
    /** until when the link of the token works (GET /reset-password/status/{token}) */
    tokenExpiresAt: string | null;
    isLoading: boolean;
    showPassword: boolean;
    setShowPassword: (visible: boolean) => void;
    setMode: (mode: RepasswordMode) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    handleRequest: (e: FormEvent<HTMLFormElement>) => void;
    handleReset: (e: FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
    retryCheck: () => void;
}
