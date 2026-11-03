// src/features/auth/login-register/hooks/useAuthForm.ts
import {loginService, registerService} from "@auth/login-register/services/auth.service.ts";
import type {AuthErrors} from "@auth/login-register/types/AuthErrors.ts";
import {AuthMode} from "@auth/login-register/types/AuthMode.ts";
import type {RegistrationResult} from "@auth/login-register/types/RegistrationResult.ts";
import type {UseAuthFormReturn} from "@auth/login-register/types/UseAuthFormReturn.ts";
import {validateAuth} from "@auth/login-register/utils/validateAuth.ts";
import {calculatePasswordStrength, type PasswordStrength} from "@auth/utils/passwordStrength.service.ts";
import type {Locale} from "@i18n/locales.ts";
import {ApiErrorType, isApiError} from "@shared/api/ApiError.ts";
import {rememberUserId} from "@shared/auth/tokenStorage.ts";
import {useSession} from "@shared/auth/useSession.ts";
import {type Dispatch, type FormEvent, type SetStateAction, useCallback, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {LoginResponse, RegisterResponse} from '@shared/types/auth/index.ts';

/**
 * Hook shared for Login / Register.
 *
 * NOTA (nov/2026):
 * - login: POST /api/login_check; os tokens vão para a sessão (SessionProvider),
 *   e o httpClient manda o JWT e renova com o refresh token sozinho;
 * - cadastro: POST /{locale}/api/register com agreeTerms; o user_id da resposta
 *   fica guardado para a tela de espera consultar o status da verificação.
 */
export function useAuthForm(
    onLoggedIn: () => void,
    onRegistered: (result: RegistrationResult) => void,
    locale: Locale,
    mode: AuthMode,
    initialEmail: string = ""
): UseAuthFormReturn {
    const {t}: Translation = useTranslation();
    const session: SessionValue = useSession();
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>(initialEmail);
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [confirmPassword, setConfirmPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [agreeTerms, setAgreeTerms]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [errors, setErrors]: [AuthErrors, Dispatch<SetStateAction<AuthErrors>>] = useState<AuthErrors>({});
    const [apiError, setApiError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [showPassword, setShowPassword]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [isLoading, setIsLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const strength: PasswordStrength = useMemo((): PasswordStrength => calculatePasswordStrength(password), [password]);

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = useCallback(
        async (e: FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();
            setApiError(null);

            // local validation before calling the API
            const validation: AuthErrors = validateAuth(email, password, confirmPassword, agreeTerms, mode, t);
            setErrors(validation);
            if (Object.keys(validation).length !== 0) return;

            setIsLoading(true);
            try {
                if (mode === AuthMode.Login) {
                    const tokens: LoginResponse = await loginService({email: email.trim(), password});
                    session.startSession({token: tokens.token, refreshToken: tokens.refresh_token});
                    onLoggedIn();
                    return;
                }

                const {data}: ApiResult<RegisterResponse> = await registerService(locale, {email: email.trim(), password, agreeTerms});
                rememberUserId(email.trim(), data.user_id);
                onRegistered({email: email.trim(), userId: data.user_id, deliveryError: null});
            } catch (err: unknown) {
                if (mode === AuthMode.Register && isApiError(err) && err.type === ApiErrorType.EmailDelivery) {
                    // 503: a conta foi criada, mas o email não saiu; a próxima tela oferece o reenvio
                    onRegistered({email: email.trim(), userId: null, deliveryError: err.message});
                    return;
                }
                setApiError(err);
            } finally {
                setIsLoading(false);
            }
        },
        [email, password, confirmPassword, agreeTerms, mode, locale, t, session, onLoggedIn, onRegistered]
    );

    return {
        email,
        password,
        confirmPassword,
        agreeTerms,
        errors,
        apiError,
        strength,
        showPassword,
        isLoading,
        setEmail,
        setPassword,
        setConfirmPassword,
        setAgreeTerms,
        setShowPassword,
        handleSubmit: (e: FormEvent<HTMLFormElement>): void => void handleSubmit(e),
    };
}
