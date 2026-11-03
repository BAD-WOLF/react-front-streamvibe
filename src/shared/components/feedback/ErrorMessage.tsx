import {errorMessage, isApiError} from '@shared/api/ApiError.ts';
import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import {RotateCw} from 'lucide-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

/** O erro da API como ela mandou: a mensagem e, em validação, a lista por campo. */
export function ErrorMessage({error, onRetry}: { error: unknown; onRetry?: (() => void) | undefined }): ReactElement {
    const {t}: Translation = useTranslation();
    const details: string[] = isApiError(error) ? error.errors : [];

    return (
        <div className={feedbackClasses.errorContainer} role="alert">
            <p>{errorMessage(error, t('Unexpected error. Please try again later.'))}</p>
            {details.length > 0 && (
                <ul className={feedbackClasses.errorList}>
                    {details.map((detail: string): ReactElement => <li key={detail}>{detail}</li>)}
                </ul>
            )}
            {onRetry !== undefined && (
                <button type="button" className={feedbackClasses.errorRetry} onClick={onRetry}>
                    <RotateCw className="w-4 h-4"/> {t('Try again')}
                </button>
            )}
        </div>
    );
}
