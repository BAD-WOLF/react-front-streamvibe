import {hasText} from '@shared/utils/guards.ts';
import {useEffect} from 'react';

const APP_NAME: string = 'StreamVibe';

export function useDocumentTitle(title: string | null | undefined): void {
    useEffect((): void => {
        document.title = hasText(title) ? `${title} · ${APP_NAME}` : APP_NAME;
    }, [title]);
}
