import {getHealthService} from '@shared/api/health.service.ts';
import {footerClasses} from '@shared/styles/ts/layout/FooterStyles.ts';
import type {HealthResponse} from '@shared/types/api/health.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

const CHECK_EVERY_MS: number = 60_000;

type Status = 'checking' | 'online' | 'offline';

/** O estado da API pelo GET /health, conferido a cada minuto. */
export function ApiStatus(): ReactElement {
    const {t}: Translation = useTranslation();
    const [status, setStatus]: [Status, Dispatch<SetStateAction<Status>>] = useState<Status>('checking');

    useEffect((): () => void => {
        const controller: AbortController = new AbortController();
        const check: () => void = (): void => {
            getHealthService(controller.signal)
                .then(({status: health}: HealthResponse): void => setStatus(health === 'ok' ? 'online' : 'offline'))
                .catch((): void => {
                    if (!controller.signal.aborted) setStatus('offline');
                });
        };
        check();
        const interval: ReturnType<typeof setInterval> = setInterval(check, CHECK_EVERY_MS);
        return (): void => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    const labels: Record<Status, string> = {checking: t('Checking the API...'), online: t('API online'), offline: t('API offline')};
    const dots: Record<Status, string> = {checking: footerClasses.statusChecking, online: footerClasses.statusOnline, offline: footerClasses.statusOffline};

    return (
        <p className={footerClasses.status} role="status">
            <span className={`${footerClasses.statusDot} ${dots[status]}`}/>
            {labels[status]}
        </p>
    );
}
