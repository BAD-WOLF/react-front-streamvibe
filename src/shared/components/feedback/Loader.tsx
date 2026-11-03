import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

export function Loader({label, inline = false}: { label?: string; inline?: boolean }): ReactElement {
    const {t}: Translation = useTranslation();

    if (inline) return <span className={feedbackClasses.loaderInline} role="status" aria-label={label ?? t('Loading...')}/>;

    return (
        <div className={feedbackClasses.loaderContainer} role="status">
            <div className={feedbackClasses.loaderSpinner}/>
            <span>{label ?? t('Loading...')}</span>
        </div>
    );
}
