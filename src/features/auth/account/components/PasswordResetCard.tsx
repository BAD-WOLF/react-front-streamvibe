import RequestResult from '@auth/repassword/components/RequestResult.tsx';
import {requestPasswordReset} from '@auth/repassword/services/repassword.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {RepasswordRequestResponse} from '@shared/types/auth/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/** "Trocar minha senha": o mesmo POST /reset-password, com o email da sessão. */
export default function PasswordResetCard(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const session: SessionValue = useSession();
    const [result, setResult]: [RepasswordRequestResponse | null, Dispatch<SetStateAction<RepasswordRequestResponse | null>>] = useState<RepasswordRequestResponse | null>(null);
    const [error, setError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [sending, setSending]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const email: string = session.user?.email ?? '';

    const send: () => Promise<void> = async (): Promise<void> => {
        setSending(true);
        setError(null);
        try {
            setResult((await requestPasswordReset(locale, {email})).data);
        } catch (caught: unknown) {
            setError(caught);
        } finally {
            setSending(false);
        }
    };

    return (
        <section className={accountClasses.card}>
            <h2 className={accountClasses.cardTitle}>{t('Change password')}</h2>
            <p className={accountClasses.cardText}>{t('We will email you a link to set a new password. After the change, every session of your account is closed.')}</p>
            {result !== null && <RequestResult result={result} email={email} locale={locale}/>}
            {error !== null && <ErrorMessage error={error}/>}
            <button type="button" className={accountClasses.button} disabled={sending || email === ''} onClick={(): void => void send()}>
                {sending ? t('Sending...') : t('Send me the link')}
            </button>
        </section>
    );
}
