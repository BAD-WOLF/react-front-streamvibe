import {getVerificationStatusService} from "@auth/verify-email/services/verifyEmail.service.ts";
import type {Locale} from "@i18n/locales.ts";
import {useLocale} from "@shared/hooks/useLocale.ts";
import type {ApiResult} from "@shared/types/api/envelope.ts";
import type {EmailVerificationStatusResponse} from "@shared/types/auth/index.ts";
import {type Dispatch, type SetStateAction, useEffect, useState} from "react";

const POLL_EVERY_MS: number = 5_000;
const MAX_ATTEMPTS: number = 180; // 15 minutos

export type RegistrationStatus = {
    verified: boolean;
    /** desistiu de perguntar (MAX_ATTEMPTS); o reenvio e o login continuam na tela */
    stopped: boolean;
};

/**
 * Depois do cadastro, pergunta à API se o email já foi confirmado
 * (GET /verify/email/status/{userId}), até a pessoa abrir o link.
 */
export function useRegistrationStatus(userId: number | null): RegistrationStatus {
    const locale: Locale = useLocale();
    const [verified, setVerified]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [stopped, setStopped]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    useEffect((): (() => void) | undefined => {
        if (userId === null) return undefined;
        const controller: AbortController = new AbortController();
        let attempts: number = 0;
        let timeout: ReturnType<typeof setTimeout>;

        const poll: () => Promise<void> = async (): Promise<void> => {
            attempts++;
            try {
                const {data}: ApiResult<EmailVerificationStatusResponse> = await getVerificationStatusService(locale, userId, controller.signal);
                if (data.verified) {
                    setVerified(true);
                    return;
                }
            } catch {
                if (controller.signal.aborted) return; // erro de rede: tenta de novo na próxima volta
            }
            if (attempts >= MAX_ATTEMPTS) {
                setStopped(true);
                return;
            }
            timeout = setTimeout((): void => void poll(), POLL_EVERY_MS);
        };

        timeout = setTimeout((): void => void poll(), POLL_EVERY_MS);
        return (): void => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [locale, userId]);

    return {verified, stopped};
}
