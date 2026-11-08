import {
    cancelPasswordReset, confirmPasswordReset, getResetPasswordStatus, requestPasswordReset,
} from "@auth/repassword/services/repassword.service.ts";
import {RepasswordMode} from "@auth/repassword/types/RepasswordMode.ts";
import type {UseRepasswordReturn} from "@auth/repassword/types/UseRepasswordReturn.ts";
import {validateRepasswordFields} from "@auth/repassword/utils/validateRepassword.ts";
import type {RepasswordErrors} from "@auth/repassword/types/RepasswordErrors.ts";
import {calculatePasswordStrength, type PasswordStrength} from "@auth/utils/passwordStrength.service.ts";
import type {Locale} from "@i18n/locales.ts";
import {ApiErrorType, isApiError} from "@shared/api/ApiError.ts";
import {useSession} from "@shared/auth/useSession.ts";
import type {ApiResult} from "@shared/types/api/envelope.ts";
import type {RepasswordRequestResponse, RepasswordStatusResponse} from "@shared/types/auth/index.ts";
import {hasText} from "@shared/utils/guards.ts";
import {type Dispatch, type FormEvent, type SetStateAction, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/** O passo da tela para os erros de token da API. */
function tokenProblem(error: unknown): RepasswordMode | null {
    if (!isApiError(error)) return null;
    if (error.type === ApiErrorType.ExpiredResetToken || error.status === 410) return RepasswordMode.Expired;
    if (error.type === ApiErrorType.InvalidResetToken || error.type === ApiErrorType.ResetTokenNotFound) return RepasswordMode.Invalid;
    return null;
}

export function useRepassword(locale: Locale, token?: string, initialEmail: string = ""): UseRepasswordReturn {
    const {t}: Translation = useTranslation();
    const session: SessionValue = useSession();
    const [mode, setMode]: [RepasswordMode, Dispatch<SetStateAction<RepasswordMode>>] = useState<RepasswordMode>(hasText(token) ? RepasswordMode.Checking : RepasswordMode.Request);
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>(initialEmail);
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [confirmPassword, setConfirmPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [errors, setErrors]: [RepasswordErrors, Dispatch<SetStateAction<RepasswordErrors>>] = useState<RepasswordErrors>({});
    const [apiError, setApiError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [requestResult, setRequestResult]: [RepasswordRequestResponse | null, Dispatch<SetStateAction<RepasswordRequestResponse | null>>] = useState<RepasswordRequestResponse | null>(null);
    const [tokenExpiresAt, setTokenExpiresAt]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<string | null>(null);
    const [isLoading, setIsLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [showPassword, setShowPassword]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [checkNonce, setCheckNonce]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);

    const strength: PasswordStrength = useMemo((): PasswordStrength => calculatePasswordStrength(password), [password]);

    // clear errors whenever the mode changes
    useEffect((): void => {
        setErrors({});
        setApiError(null);
    }, [mode]);

    // the token of the link: can it still be used? (GET /reset-password/status/{token})
    useEffect((): (() => void) | undefined => {
        if (!hasText(token)) return undefined;
        const controller: AbortController = new AbortController();
        setMode(RepasswordMode.Checking);
        setApiError(null);
        getResetPasswordStatus(locale, token, controller.signal)
            .then(({data}: ApiResult<RepasswordStatusResponse>): void => {
                setTokenExpiresAt(data.expires_at);
                if (data.valid) setMode(RepasswordMode.Reset);
                else setMode(data.expired ? RepasswordMode.Expired : RepasswordMode.Invalid);
            })
            .catch((error: unknown): void => {
                if (controller.signal.aborted) return;
                const problem: RepasswordMode | null = tokenProblem(error);
                if (problem !== null) setMode(problem);
                else setApiError(error);
            });
        return (): void => controller.abort();
    }, [locale, token, checkNonce]);

    // 1) Request the email with the link
    const handleRequest: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const validation: RepasswordErrors = validateRepasswordFields(RepasswordMode.Request, email, "", "", t);
        setErrors(validation);
        setApiError(null);
        if (Object.keys(validation).length !== 0) return;

        setIsLoading(true);
        try {
            const {data}: ApiResult<RepasswordRequestResponse> = await requestPasswordReset(locale, {email: email.trim()});
            setRequestResult(data);
            setMode(RepasswordMode.Requested);
        } catch (err: unknown) {
            setApiError(err); // 403 conta não verificada, 429 pedido recente, 503 email não enviado
        } finally {
            setIsLoading(false);
        }
    };

    // 2) Set the new password
    const handleReset: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!hasText(token)) return;
        const validation: RepasswordErrors = validateRepasswordFields(RepasswordMode.Reset, "", password, confirmPassword, t);
        setErrors(validation);
        setApiError(null);
        if (Object.keys(validation).length !== 0) return;

        setIsLoading(true);
        try {
            await confirmPasswordReset(locale, {token, password});
            // NOTA (nov/2026): a API revoga todos os refresh tokens da conta; a
            // sessão deste navegador também termina (e o cookie é apagado), e o
            // login é com a senha nova.
            void session.endSession();
            setMode(RepasswordMode.Done);
        } catch (err: unknown) {
            const problem: RepasswordMode | null = tokenProblem(err);
            if (problem !== null) setMode(problem);
            else setApiError(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 3) "I did not ask for this": the link stops working
    const handleCancel: () => Promise<void> = async (): Promise<void> => {
        if (!hasText(token)) return;
        setIsLoading(true);
        setApiError(null);
        try {
            await cancelPasswordReset(locale, {token});
            setMode(RepasswordMode.Cancelled);
        } catch (err: unknown) {
            const problem: RepasswordMode | null = tokenProblem(err);
            if (problem !== null) setMode(problem);
            else setApiError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        mode,
        email,
        password,
        strength,
        confirmPassword,
        errors,
        apiError,
        requestResult,
        tokenExpiresAt,
        isLoading,
        showPassword,
        setShowPassword,
        setMode,
        setEmail,
        setPassword,
        setConfirmPassword,
        handleRequest: (e: FormEvent<HTMLFormElement>): void => void handleRequest(e),
        handleReset: (e: FormEvent<HTMLFormElement>): void => void handleReset(e),
        handleCancel: (): void => void handleCancel(),
        retryCheck: (): void => setCheckNonce((value: number): number => value + 1),
    };
}
