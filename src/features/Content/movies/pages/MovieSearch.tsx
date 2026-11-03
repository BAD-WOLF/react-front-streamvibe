import {MoviePosterGrid} from '@content/movies/components/MoviePosterGrid.tsx';
import {searchMovies} from '@content/movies/services/movie.service.ts';
import {movieToCard, uniqueById} from '@content/movies/utils/movieCards.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Pagination} from '@shared/components/Pagination.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {movieListClasses, movieSearchClasses} from '@shared/styles/ts/movies/MovieListStyles.ts';
import type {MovieListItem, MovieListResponse, MovieSearchFilters} from '@shared/types/movie/index.ts';
import {Search} from 'lucide-react';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {type SetURLSearchParams, useSearchParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import {pageFromQuery} from '@shared/routing/paths.ts';

const MIN_YEAR: number = 1874;
const MAX_YEAR: number = 2100;

type FilterForm = {
    year: string;
    primaryReleaseYear: string;
    region: string;
    includeAdult: boolean;
};

/** Os erros do formulário, um por campo (a busca e os filtros). */
type SearchErrors = Partial<Record<keyof FilterForm | 'query', string>>;

type InputChange = (event: ChangeEvent<HTMLInputElement>) => void;

function readYear(value: string | null): number | undefined {
    const year: number = Number(value);
    return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR ? year : undefined;
}

/**
 * GET /movies/search/{query}/{page} com todos os filtros da API: ano de
 * qualquer lançamento, ano do lançamento principal, região (ISO 3166-1) e
 * conteúdo adulto. Os filtros ficam na URL, para o link da busca funcionar.
 */
export function MovieSearch(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [searchParams, setSearchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();

    const query: string = (searchParams.get('q') ?? '').trim();
    const page: number = pageFromQuery(searchParams.get('page'));
    const filters: MovieSearchFilters = {
        year: readYear(searchParams.get('year')),
        primaryReleaseYear: readYear(searchParams.get('primary_release_year')),
        region: /^[A-Z]{2}$/.test(searchParams.get('region') ?? '') ? searchParams.get('region') ?? undefined : undefined,
        includeAdult: searchParams.get('include_adult') === '1',
    };

    const [draft, setDraft]: [string, Dispatch<SetStateAction<string>>] = useState<string>(query);
    const [form, setForm]: [FilterForm, Dispatch<SetStateAction<FilterForm>>] = useState<FilterForm>({
        year: filters.year !== undefined ? String(filters.year) : '',
        primaryReleaseYear: filters.primaryReleaseYear !== undefined ? String(filters.primaryReleaseYear) : '',
        region: filters.region ?? '',
        includeAdult: filters.includeAdult ?? false,
    });
    const [showFilters, setShowFilters]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(
        filters.year !== undefined || filters.primaryReleaseYear !== undefined || filters.region !== undefined || filters.includeAdult === true
    );
    const [formErrors, setFormErrors]: [SearchErrors, Dispatch<SetStateAction<SearchErrors>>] = useState<SearchErrors>({});
    useDocumentTitle(query !== '' ? `${t('Search results')}: ${query}` : t('Search movies'));

    // a busca do Header troca o ?q= com esta página aberta
    useEffect((): void => setDraft(query), [query]);

    const result: AsyncState<MovieListResponse> = useAsync<MovieListResponse>(
        async (signal: AbortSignal): Promise<MovieListResponse> => (await searchMovies(locale, query, page, filters, signal)).data,
        query !== '' ? `${locale}|${query}|${page}|${JSON.stringify(filters)}` : null
    );

    const validate: () => SearchErrors = (): SearchErrors => {
        const errors: SearchErrors = {};
        const yearMessage: string = t('Use a year between {{min}} and {{max}}.', {min: MIN_YEAR, max: MAX_YEAR});
        if (draft.trim() === '') errors.query = t('Type something to search.');
        else if (draft.trim().length > 255) errors.query = t('The search can have up to 255 characters.');
        if (form.year !== '' && readYear(form.year) === undefined) errors.year = yearMessage;
        if (form.primaryReleaseYear !== '' && readYear(form.primaryReleaseYear) === undefined) errors.primaryReleaseYear = yearMessage;
        if (form.region !== '' && !/^[A-Z]{2}$/.test(form.region)) errors.region = t('Use the two-letter country code (e.g. BR).');
        return errors;
    };

    const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const errors: SearchErrors = validate();
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const next: URLSearchParams = new URLSearchParams({q: draft.trim()});
        if (form.year !== '') next.set('year', form.year);
        if (form.primaryReleaseYear !== '') next.set('primary_release_year', form.primaryReleaseYear);
        if (form.region !== '') next.set('region', form.region);
        if (form.includeAdult) next.set('include_adult', '1');
        setSearchParams(next);
    };

    const goToPage: (next: number) => void = (next: number): void => {
        const params: URLSearchParams = new URLSearchParams(searchParams);
        params.set('page', String(next));
        setSearchParams(params);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const update: (field: keyof FilterForm) => InputChange = (field: keyof FilterForm): InputChange => (event: ChangeEvent<HTMLInputElement>): void => {
        const value: string | boolean = field === 'includeAdult' ? event.target.checked : event.target.value;
        setForm({...form, [field]: field === 'region' ? String(value).toUpperCase() : value});
    };

    const movies: MovieListItem[] = uniqueById(result.data?.movies ?? []);

    return (
        <div className={movieListClasses.page}>
            <h1 className={`${movieListClasses.title} mb-6`}>{t('Search movies')}</h1>

            <form className={movieSearchClasses.form} onSubmit={handleSubmit} noValidate>
                <div className={movieSearchClasses.queryRow}>
                    <input
                        className={movieSearchClasses.queryInput}
                        type="search"
                        value={draft}
                        maxLength={255}
                        placeholder={t('Movie title...')}
                        aria-label={t('Movie title...')}
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => setDraft(event.target.value)}
                    />
                    <button className={movieSearchClasses.submit} type="submit">
                        <Search className="w-4 h-4"/> {t('Search now')}
                    </button>
                </div>
                {formErrors.query !== undefined && <p className={movieSearchClasses.fieldError}>{formErrors.query}</p>}

                <button type="button" className={movieSearchClasses.filtersToggle} onClick={(): void => setShowFilters(!showFilters)}>
                    {showFilters ? t('Hide filters') : t('More filters')}
                </button>

                {showFilters && (
                    <div className={movieSearchClasses.filters}>
                        <label className={movieSearchClasses.field}>
                            <span className={movieSearchClasses.label}>{t('Year (any release)')}</span>
                            <input className={movieSearchClasses.input} type="number" min={MIN_YEAR} max={MAX_YEAR} value={form.year} onChange={update('year')}/>
                            {formErrors.year !== undefined && <span className={movieSearchClasses.fieldError}>{formErrors.year}</span>}
                        </label>
                        <label className={movieSearchClasses.field}>
                            <span className={movieSearchClasses.label}>{t('Year of the main release')}</span>
                            <input className={movieSearchClasses.input} type="number" min={MIN_YEAR} max={MAX_YEAR} value={form.primaryReleaseYear} onChange={update('primaryReleaseYear')}/>
                            {formErrors.primaryReleaseYear !== undefined && <span className={movieSearchClasses.fieldError}>{formErrors.primaryReleaseYear}</span>}
                        </label>
                        <label className={movieSearchClasses.field}>
                            <span className={movieSearchClasses.label}>{t('Release region (e.g. BR)')}</span>
                            <input className={movieSearchClasses.input} type="text" maxLength={2} value={form.region} onChange={update('region')}/>
                            {formErrors.region !== undefined && <span className={movieSearchClasses.fieldError}>{formErrors.region}</span>}
                        </label>
                        <label className={movieSearchClasses.checkbox}>
                            <input type="checkbox" checked={form.includeAdult} onChange={update('includeAdult')}/>
                            {t('Include adult titles')}
                        </label>
                    </div>
                )}
            </form>

            {query === '' && <p className={movieSearchClasses.summary}>{t('Search TMDB movies by title.')}</p>}
            {result.loading && <Loader/>}
            {result.error !== null && <ErrorMessage error={result.error} onRetry={result.reload}/>}

            {result.data !== null && !result.loading && (
                <>
                    <p className={movieSearchClasses.summary}>{t('{{count}} results for "{{query}}"', {count: result.data.total_results, query})}</p>
                    <MoviePosterGrid cards={movies.map((movie: MovieListItem): MovieCardData => movieToCard(movie, locale))} empty={t('No movies found.')}/>
                    <Pagination page={page} totalPages={result.data.total_pages} onChange={goToPage}/>
                </>
            )}
        </div>
    );
}
