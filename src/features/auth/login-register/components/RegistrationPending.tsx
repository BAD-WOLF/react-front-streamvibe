import {type RegistrationStatus, useRegistrationStatus} from "@auth/login-register/hooks/useRegistrationStatus.ts";
import type {RegistrationResult} from "@auth/login-register/types/RegistrationResult.ts";
import ResendVerificationForm from "@auth/verify-email/components/ResendVerificationForm.tsx";
import {Loader} from "@shared/components/feedback/Loader.tsx";
import {Notice} from "@shared/components/feedback/Notice.tsx";
import {authClasses} from "@shared/styles/ts/login/AuthStyles.ts";
import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

/**
 * "Confira seu email": a conta existe, mas só faz login depois de abrir o
 * link de confirmação. A tela acompanha o status pela API e reenvia o email.
 */
export default function RegistrationPending({result, onBackToLogin}: {
    result: RegistrationResult;
    onBackToLogin: (email: string) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const {verified, stopped}: RegistrationStatus = useRegistrationStatus(result.userId);

    if (verified) {
        return (
            <div className={authClasses.stack}>
                <Notice tone="success">{t("Email confirmed! You can log in now.")}</Notice>
                <button type="button" className={authClasses.primaryButton} onClick={(): void => onBackToLogin(result.email)}>
                    {t("Log in")}
                </button>
            </div>
        );
    }

    return (
        <div className={authClasses.stack}>
            <h2 className={authClasses.title}>{t("Check your email")}</h2>
            {hasText(result.deliveryError) ? (
                <Notice tone="warning">
                    {t("Your account was created, but the confirmation email could not be sent. Try sending it again.")}
                </Notice>
            ) : (
                <p className={authClasses.text}>
                    {t("We sent a confirmation link to {{email}}. Open it to activate your account.", {email: result.email})}
                </p>
            )}

            {result.userId !== null && !stopped && <Loader label={t("Waiting for the confirmation...")}/>}

            <ResendVerificationForm initialEmail={result.email} lockEmail onAlreadyVerified={(): void => onBackToLogin(result.email)}/>

            <button type="button" className={authClasses.secondaryButton} onClick={(): void => onBackToLogin(result.email)}>
                {t("I already confirmed, log in")}
            </button>
        </div>
    );
}
