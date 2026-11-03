import {resendVerificationService} from '@auth/verify-email/services/verifyEmail.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {ApiErrorType, isApiError} from '@shared/api/ApiError.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {ResendVerificationResponse} from '@shared/types/auth/index.ts';
import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';

export type ResendStatus = 'idle' | 'sending' | 'sent' | 'already-verified' | 'error';

const COOLDOWN_SECONDS: number = 30;

export type UseResendVerificationReturn = {
    status: ResendStatus;
    /** email_sent da API: false quando nenhuma conta usa o email (resposta genérica). */
    emailSent: boolean | null;
    error: unknown;
    cooldown: number;
    resend: (email: string) => Promise<void>;
};

/** POST /{locale}/api/resend-verification, com uma espera entre um envio e outro. */
export function useResendVerification(): UseResendVerificationReturn {
    const locale: Locale = useLocale();
    const [status, setStatus]: [ResendStatus, Dispatch<SetStateAction<ResendStatus>>] = useState<ResendStatus>('idle');
    const [emailSent, setEmailSent]: [boolean | null, Dispatch<SetStateAction<boolean | null>>] = useState<boolean | null>(null);
    const [error, setError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [cooldown, setCooldown]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);

    useEffect((): (() => void) | undefined => {
        if (cooldown <= 0) return undefined;
        const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => setCooldown(cooldown - 1), 1000);
        return (): void => clearTimeout(timeout);
    }, [cooldown]);

    const resend: (email: string) => Promise<void> = async (email: string): Promise<void> => {
        setStatus('sending');
        setError(null);
        try {
            const {data}: ApiResult<ResendVerificationResponse> = await resendVerificationService(locale, {email: email.trim()});
            setEmailSent(data.email_sent);
            setStatus('sent');
            setCooldown(COOLDOWN_SECONDS);
        } catch (caught: unknown) {
            if (isApiError(caught) && caught.type === ApiErrorType.UserAlreadyExists) {
                setStatus('already-verified'); // 409: a conta já confirmou o email
                return;
            }
            setError(caught);
            setStatus('error');
        }
    };

    return {status, emailSent, error, cooldown, resend};
}
