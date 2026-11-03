import {useResendVerification, type UseResendVerificationReturn} from '@auth/verify-email/hooks/useResendVerification.ts';
import {validateEmail} from '@auth/utils/passwordRules.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {authClasses} from '@shared/styles/ts/login/AuthStyles.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

/**
 * "Não recebi o email de confirmação": reenvia o link (POST /resend-verification).
 * Usado no login, na espera depois do cadastro, num link de verificação vencido
 * e na troca de senha de conta não verificada.
 */
export default function ResendVerificationForm({initialEmail = '', lockEmail = false, onAlreadyVerified}: {
    initialEmail?: string | undefined;
    lockEmail?: boolean | undefined;
    onAlreadyVerified?: (() => void) | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const {status, emailSent, error, cooldown, resend}: UseResendVerificationReturn = useResendVerification();
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>(initialEmail);
    const [emailError, setEmailError]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<string | null>(null);

    const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const problem: string | null = validateEmail(email, t);
        setEmailError(problem);
        if (problem === null) void resend(email);
    };

    if (status === 'already-verified') {
        return (
            <Notice tone="success">
                {t('This account has already confirmed its email. You can log in.')}{' '}
                {onAlreadyVerified !== undefined && <button type="button" className={authClasses.link} onClick={onAlreadyVerified}>{t('Log in')}</button>}
            </Notice>
        );
    }

    return (
        <form className={authClasses.stack} onSubmit={handleSubmit} noValidate>
            {!lockEmail && (
                <>
                    <input
                        className={authClasses.emailInput}
                        type="email"
                        value={email}
                        placeholder={t('Your email')}
                        aria-label={t('Your email')}
                        autoComplete="email"
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
                    />
                    {emailError !== null && <p className={authClasses.fieldError}>{emailError}</p>}
                </>
            )}

            {status === 'sent' && (
                <Notice tone={emailSent === true ? 'success' : 'info'}>
                    {emailSent === true ? t('We sent a new confirmation email.') : t('If an account uses this email, a new confirmation link is on its way.')}
                </Notice>
            )}
            {status === 'error' && <ErrorMessage error={error}/>}

            <button type="submit" className={authClasses.secondaryButton} disabled={status === 'sending' || cooldown > 0}>
                {status === 'sending'
                    ? t('Sending...')
                    : cooldown > 0 ? t('Send again in {{seconds}}s', {seconds: cooldown}) : t('Resend the confirmation email')}
            </button>
        </form>
    );
}
