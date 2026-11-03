import {getVerificationStatusService} from '@auth/verify-email/services/verifyEmail.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {EmailVerificationStatusResponse} from '@shared/types/auth/index.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

/** Para administradores: uma conta já confirmou o email? (GET /verify/email/status/{userId}) */
export default function VerificationStatusCard(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [userId, setUserId]: [string, Dispatch<SetStateAction<string>>] = useState<string>('');
    const [result, setResult]: [EmailVerificationStatusResponse | null, Dispatch<SetStateAction<EmailVerificationStatusResponse | null>>] = useState<EmailVerificationStatusResponse | null>(null);
    const [error, setError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);

    const check: (event: FormEvent<HTMLFormElement>) => Promise<void> = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const id: number = Number(userId);
        if (!Number.isInteger(id) || id < 1) {
            setError(new Error(t('Type a valid account id (a positive whole number).')));
            return;
        }
        setError(null);
        try {
            setResult((await getVerificationStatusService(locale, id)).data);
        } catch (caught: unknown) {
            setResult(null);
            setError(caught);
        }
    };

    return (
        <section className={accountClasses.card}>
            <h2 className={accountClasses.cardTitle}>{t('Email verification of an account')}</h2>
            <form className={accountClasses.row} onSubmit={(event: FormEvent<HTMLFormElement>): void => void check(event)}>
                <label className={accountClasses.field}>
                    <span className={accountClasses.factLabel}>{t('Account id')}</span>
                    <input className={accountClasses.input} type="number" min={1} value={userId}
                           onChange={(event: ChangeEvent<HTMLInputElement>): void => setUserId(event.target.value)}/>
                </label>
                <button type="submit" className={accountClasses.button}>{t('Check status')}</button>
            </form>
            {error !== null && <ErrorMessage error={error}/>}
            {result !== null && (
                <Notice tone={result.verified ? 'success' : 'warning'}>
                    {result.verified
                        ? t('Account {{id}} has confirmed its email.', {id: result.user_id})
                        : t('Account {{id}} has not confirmed its email yet.', {id: result.user_id})}
                </Notice>
            )}
        </section>
    );
}
