import {useImageUrl} from '@content/images/hooks/useImageUrl.ts';
import type {Locale} from '@i18n/locales.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {
    MovieDetailsResponse, ProductionCompany, ProductionCountry, SpokenLanguage
} from '@shared/types/movie/index.ts';
import {formatDate, formatMoney} from '@shared/utils/format.ts';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import {isPresent, textOr} from '@shared/utils/guards.ts';

function Fact({label, children}: { label: string; children: ReactNode }): ReactElement | null {
    if (children === null || children === undefined || children === '') return null;
    return (
        <div className={movieDetailsClasses.fact}>
            <span className={movieDetailsClasses.factLabel}>{label}</span>
            <span className={movieDetailsClasses.factValue}>{children}</span>
        </div>
    );
}

function CompanyBadge({company}: { company: ProductionCompany }): ReactElement {
    const logoUrl: string | null = useImageUrl(company.logo_path, 'w92');
    return (
        <span className={movieDetailsClasses.company} title={textOr(company.origin_country, undefined)}>
            {logoUrl !== null ? <img className={movieDetailsClasses.companyLogo} src={logoUrl} alt={company.name}/> : company.name}
        </span>
    );
}

function CollectionCard({movie}: { movie: MovieDetailsResponse }): ReactElement | null {
    const {t}: Translation = useTranslation();
    const posterUrl: string | null = useImageUrl(movie.belongs_to_collection?.poster_path, 'w92');
    if (!isPresent(movie.belongs_to_collection)) return null;

    return (
        <div className={movieDetailsClasses.collection}>
            {posterUrl !== null && <img className={movieDetailsClasses.collectionPoster} src={posterUrl} alt={movie.belongs_to_collection.name}/>}
            <div>
                <span className={movieDetailsClasses.factLabel}>{t('Part of the collection')}</span>
                <span className="text-lg font-semibold">{movie.belongs_to_collection.name}</span>
            </div>
        </div>
    );
}

export function MovieFacts({movie}: { movie: MovieDetailsResponse }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();

    return (
        <div className="space-y-4">
            <div className={movieDetailsClasses.facts}>
                <Fact label={t('Status')}>{movie.status}</Fact>
                <Fact label={t('Release date')}>{formatDate(movie.release_date, locale)}</Fact>
                <Fact label={t('Runtime')}>{movie.formatted_runtime}</Fact>
                <Fact label={t('Original language')}>{movie.original_language.toUpperCase()}</Fact>
                <Fact label={t('Spoken languages')}>
                    {movie.spoken_languages.map((language: SpokenLanguage): string => textOr(language.name, language.english_name)).join(', ')}
                </Fact>
                <Fact label={t('Production countries')}>
                    {movie.production_countries.map((country: ProductionCountry): string => country.name).join(', ')}
                </Fact>
                <Fact label={t('Country of origin')}>{movie.origin_country.join(', ')}</Fact>
                <Fact label={t('Budget')}>{formatMoney(movie.budget, locale)}</Fact>
                <Fact label={t('Box office')}>{formatMoney(movie.revenue, locale)}</Fact>
                <Fact label={t('Votes')}>{movie.vote_count > 0 ? `${movie.vote_average.toFixed(1)} / 10 (${movie.vote_count})` : null}</Fact>
            </div>

            <CollectionCard movie={movie}/>

            {movie.production_companies.length > 0 && (
                <div className={movieDetailsClasses.companies}>
                    {movie.production_companies.map((company: ProductionCompany): ReactElement => <CompanyBadge key={company.id} company={company}/>)}
                </div>
            )}
        </div>
    );
}
