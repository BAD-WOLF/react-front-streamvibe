import type {Locale} from '@i18n/locales.ts';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import type {RepasswordRequestResponse} from '@shared/types/auth/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

/**
 * As três respostas de POST /reset-password: link enviado; um link válido já
 * tinha sido enviado (sem email novo); ou a resposta genérica (nenhuma conta
 * com esse email, sem dizer isso).
 */
export default function RequestResult({result, email, locale}: {
    result: RepasswordRequestResponse;
    email: string;
    locale: Locale;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const until: string | null = formatDateTime(result.expires_at, locale);

    if (result.email_sent) {
        return (
            <Notice tone="success">
                {t("We sent the link to {{email}}.", {email})} {until !== null && t("It works until {{date}}.", {date: until})}
            </Notice>
        );
    }
    if (result.expires_at !== null) {
        return (
            <Notice tone="info">
                {t("A link was already sent and still works until {{date}}. Check your inbox and the spam folder.", {date: until})}
            </Notice>
        );
    }
    return <Notice tone="info">{t("If there is an account with this email, you will receive a link to set a new password.")}</Notice>;
}
