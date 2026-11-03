import {SectionTitle} from '@content/components/SectionTitle.tsx';
import {type GalleryImage, ImageGallery} from '@content/images/components/ImageGallery.tsx';
import {ExternalLinks} from '@content/person/components/ExternalLinks.tsx';
import {PersonCredits} from '@content/person/components/PersonCredits.tsx';
import {
    getPersonDetails, getPersonExternalIds, getPersonImages, getPersonMovieCredits, getPersonTvCredits
} from '@content/person/services/person.service.ts';
import {NotFound} from '@app/NotFound.tsx';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {personDetailsClasses} from '@shared/styles/ts/person/PersonDetailsStyles.ts';
import type {
    PersonDetailsResponse, PersonExternalIdsResponse, PersonImage, PersonImagesResponse, PersonMovieCreditsResponse,
    PersonTvCreditsResponse
} from '@shared/types/person/index.ts';
import {initialsOf} from '@shared/utils/format.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

const MAX_ID: number = 999999999;
const BIOGRAPHY_PREVIEW: number = 600;

function Fact({label, children}: { label: string; children: string | null }): ReactElement | null {
    if (!hasText(children)) return null;
    return (
        <div>
            <span className={personDetailsClasses.factLabel}>{label}</span>
            {children}
        </div>
    );
}

/**
 * NOTA (nov/2026): a página de uma pessoa usa as cinco rotas de pessoa da
 * API: detalhes, ids externos, fotos, créditos em filmes e créditos em séries.
 */
export function PersonDetails(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const {personId: rawId}: Readonly<Partial<{ personId: string }>> = useParams<{ personId: string }>();
    const personId: number = Number(rawId);
    const validId: boolean = Number.isInteger(personId) && personId >= 1 && personId <= MAX_ID;
    const key: string | null = validId ? `${locale}|${personId}` : null;
    const [fullBiography, setFullBiography]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const details: AsyncState<PersonDetailsResponse> = useAsync<PersonDetailsResponse>(async (signal: AbortSignal): Promise<PersonDetailsResponse> => (await getPersonDetails(locale, personId, signal)).data, key);
    const externalIds: AsyncState<PersonExternalIdsResponse> = useAsync<PersonExternalIdsResponse>(async (signal: AbortSignal): Promise<PersonExternalIdsResponse> => (await getPersonExternalIds(locale, personId, signal)).data, key);
    const images: AsyncState<PersonImagesResponse> = useAsync<PersonImagesResponse>(async (signal: AbortSignal): Promise<PersonImagesResponse> => (await getPersonImages(locale, personId, signal)).data, key);
    const movieCredits: AsyncState<PersonMovieCreditsResponse> = useAsync<PersonMovieCreditsResponse>(async (signal: AbortSignal): Promise<PersonMovieCreditsResponse> => (await getPersonMovieCredits(locale, personId, signal)).data, key);
    const tvCredits: AsyncState<PersonTvCreditsResponse> = useAsync<PersonTvCreditsResponse>(async (signal: AbortSignal): Promise<PersonTvCreditsResponse> => (await getPersonTvCredits(locale, personId, signal)).data, key);

    useDocumentTitle(details.data?.name);

    if (!validId) return <NotFound/>;
    if (details.loading && details.data === null) return <div className="pt-28"><Loader/></div>;
    if (details.error !== null || details.data === null) return <div className="pt-28 px-4"><ErrorMessage error={details.error} onRetry={details.reload}/></div>;

    const person: PersonDetailsResponse = details.data;
    const biography: string = person.formatted_biography ?? person.biography;
    const longBiography: boolean = biography.length > BIOGRAPHY_PREVIEW;
    const gallery: GalleryImage[] = (images.data?.profiles ?? []).map((image: PersonImage): GalleryImage => ({
        path: image.file_path,
        thumbUrl: image.url_w185 ?? image.url_original,
        width: image.width,
        height: image.height,
        language: image.iso_639_1,
    }));

    const born: string | null = hasText(person.formatted_birth_date)
        ? (person.is_alive && person.age !== null ? `${person.formatted_birth_date} (${t('{{age}} years old', {age: person.age})})` : person.formatted_birth_date)
        : null;
    const died: string | null = hasText(person.formatted_death_date)
        ? (person.age !== null ? `${person.formatted_death_date} (${t('aged {{age}}', {age: person.age})})` : person.formatted_death_date)
        : null;

    return (
        <div className={personDetailsClasses.page}>
            <header className={personDetailsClasses.header}>
                {hasText(person.profile_large_url)
                    ? <img className={personDetailsClasses.photo} src={person.profile_large_url} alt={person.name}/>
                    : <div className={personDetailsClasses.photoPlaceholder}>{initialsOf(person.name.replace(/\s+/g, '.'))}</div>}

                <div className={personDetailsClasses.info}>
                    <h1 className={personDetailsClasses.name}>{person.name}</h1>
                    <div className={personDetailsClasses.meta}>
                        {hasText(person.known_for_department) && <span className={personDetailsClasses.metaItem}>{t('Known for')}: {person.known_for_department}</span>}
                        {person.gender_display !== '' && <span className={personDetailsClasses.metaItem}>{person.gender_display}</span>}
                    </div>

                    <div className={personDetailsClasses.facts}>
                        <Fact label={t('Born')}>{born}</Fact>
                        <Fact label={t('Place of birth')}>{person.place_of_birth}</Fact>
                        <Fact label={t('Died')}>{died}</Fact>
                    </div>

                    {person.also_known_as.length > 0 && (
                        <p className={personDetailsClasses.alsoKnownAs}>{t('Also known as')}: {person.also_known_as.join(' · ')}</p>
                    )}

                    <ExternalLinks ids={externalIds.data} homepage={person.homepage}/>

                    {biography !== '' ? (
                        <div className="space-y-2">
                            <p className={personDetailsClasses.biography}>
                                {fullBiography || !longBiography ? biography : `${biography.slice(0, BIOGRAPHY_PREVIEW).trimEnd()}…`}
                            </p>
                            {longBiography && (
                                <button type="button" className={personDetailsClasses.biographyToggle} onClick={(): void => setFullBiography(!fullBiography)}>
                                    {fullBiography ? t('Show less') : t('Read the full biography')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className={personDetailsClasses.alsoKnownAs}>{t('No biography in this language.')}</p>
                    )}
                </div>
            </header>

            <section className={personDetailsClasses.section}>
                <SectionTitle title={t('Credits')}/>
                <PersonCredits movies={movieCredits} tv={tvCredits}/>
            </section>

            <section className={personDetailsClasses.section}>
                <SectionTitle title={t('Photos')}/>
                {images.loading && <Loader/>}
                {images.error !== null && <ErrorMessage error={images.error} onRetry={images.reload}/>}
                {images.data !== null && <ImageGallery images={gallery} type="profile" title={person.name}/>}
            </section>
        </div>
    );
}
