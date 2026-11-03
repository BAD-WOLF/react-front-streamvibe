import {RepasswordMode} from '@auth/repassword/types/RepasswordMode.ts';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {authClasses} from '@shared/styles/ts/login/AuthStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

/** Link inválido, vencido ou cancelado: o caminho é pedir outro. */
export default function TokenProblem({mode, onRequestNew}: {
    mode: RepasswordMode;
    onRequestNew: () => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const messages: Partial<Record<RepasswordMode, string>> = {
        [RepasswordMode.Invalid]: t("This link is invalid or was already used."),
        [RepasswordMode.Expired]: t("This link has expired."),
        [RepasswordMode.Cancelled]: t("Done: the link no longer works. Your password was not changed."),
    };

    return (
        <div className={authClasses.stack}>
            <Notice tone={mode === RepasswordMode.Cancelled ? 'success' : 'warning'}>{messages[mode]}</Notice>
            <button type="button" className={authClasses.secondaryButton} onClick={onRequestNew}>
                {t("Ask for a new link")}
            </button>
        </div>
    );
}
