import {type GalleryImage, ImageGallery} from '@content/images/components/ImageGallery.tsx';
import {getMovieImages} from '@content/movies/services/movie.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {type TabItem, Tabs} from '@shared/components/Tabs.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {ImageType} from '@shared/types/image/index.ts';
import type {MovieImage, MovieImagesResponse} from '@shared/types/movie/index.ts';
import {type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

type ImageTab = 'backdrops' | 'posters' | 'logos';

const TAB_TYPES: Record<ImageTab, ImageType> = {backdrops: 'backdrop', posters: 'poster', logos: 'logo'};

function toGallery(images: MovieImage[]): GalleryImage[] {
    return images.map((image: MovieImage): GalleryImage => ({
        path: image.file_path,
        thumbUrl: image.url_w500 ?? image.url_w780 ?? image.url_original,
        width: image.width,
        height: image.height,
        language: image.iso_639_1,
    }));
}

/**
 * Backdrops, posters e logos do filme. "Só no meu idioma" usa o `language` da
 * rota de imagens (o TMDB devolve só as imagens marcadas com o idioma).
 */
export function ImageSection({movieId, title}: { movieId: number; title: string }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [onlyLocale, setOnlyLocale]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [active, setActive]: [ImageTab, Dispatch<SetStateAction<ImageTab>>] = useState<ImageTab>('backdrops');

    const images: AsyncState<MovieImagesResponse> = useAsync<MovieImagesResponse>(
        async (signal: AbortSignal): Promise<MovieImagesResponse> => (await getMovieImages(locale, movieId, onlyLocale, signal)).data,
        `${locale}|${movieId}|${onlyLocale}`
    );

    const tabs: TabItem<ImageTab>[] = [
        {id: 'backdrops', label: t('Backdrops'), count: images.data?.backdrops.length},
        {id: 'posters', label: t('Posters'), count: images.data?.posters.length},
        {id: 'logos', label: t('Logos'), count: images.data?.logos.length},
    ];

    return (
        <>
            <div className={movieDetailsClasses.sectionHeader}>
                <Tabs tabs={tabs} active={active} onChange={setActive}/>
                <label className={movieDetailsClasses.toggle}>
                    <input
                        type="checkbox"
                        checked={onlyLocale}
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => setOnlyLocale(event.target.checked)}
                    />
                    {t('Only images in my language')}
                </label>
            </div>

            {images.loading && <Loader/>}
            {images.error !== null && <ErrorMessage error={images.error} onRetry={images.reload}/>}
            {images.data !== null && !images.loading && (
                <ImageGallery key={active} images={toGallery(images.data[active])} type={TAB_TYPES[active]} title={title}/>
            )}
        </>
    );
}
