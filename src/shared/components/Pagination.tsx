import {paginationClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

// NOTA (nov/2026): a API aceita page de 1 a 500 (o limite do TMDB), mesmo
// quando total_pages passa disso. As listas da administração não têm esse
// limite (maxPage).
const MAX_PAGE: number = 500;

export function Pagination({page, totalPages, onChange, maxPage = MAX_PAGE}: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    maxPage?: number;
}): ReactElement | null {
    const {t}: Translation = useTranslation();
    const lastPage: number = Math.min(totalPages, maxPage);

    if (lastPage <= 1) return null;

    return (
        <nav className={paginationClasses.container} aria-label={t('Pagination')}>
            <button type="button" className={paginationClasses.button} disabled={page <= 1} onClick={(): void => onChange(page - 1)}>
                <ChevronLeft className="w-4 h-4"/> {t('Previous')}
            </button>
            <span className={paginationClasses.label}>{t('Page {{page}} of {{total}}', {page, total: lastPage})}</span>
            <button type="button" className={paginationClasses.button} disabled={page >= lastPage} onClick={(): void => onChange(page + 1)}>
                {t('Next')} <ChevronRight className="w-4 h-4"/>
            </button>
        </nav>
    );
}
