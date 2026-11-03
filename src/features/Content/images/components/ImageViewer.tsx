import {useImageSizes} from '@content/images/hooks/useImageSizes.ts';
import {
    getImageBase64, getImageBlob, getImageInfo, getOriginalImageBlob
} from '@content/images/services/image.service.ts';
import type {GalleryImage} from '@content/images/components/ImageGallery.tsx';
import type {Locale} from '@i18n/locales.ts';
import {errorMessage} from '@shared/api/ApiError.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Modal} from '@shared/components/Modal.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {imageViewerClasses} from '@shared/styles/ts/images/ImageViewerStyles.ts';
import type {
    ImageContentResponse, ImageInfoResponse, ImageRequestOptions, ImageSize, ImageSizesResponse, ImageType
} from '@shared/types/image/index.ts';
import {formatBytes} from '@shared/utils/format.ts';
import {ChevronLeft, ChevronRight, Download, ExternalLink} from 'lucide-react';
import {type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import {hasText, type NonEmptyArray} from '@shared/utils/guards.ts';

const PREFERRED_SIZE: Record<ImageType, ImageSize> = {
    poster: 'w500',
    backdrop: 'w1280',
    logo: 'w500',
    profile: 'h632',
    still: 'w300',
};

function saveBlob(blob: Blob, fileName: string): void {
    const url: string = URL.createObjectURL(blob);
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout((): void => URL.revokeObjectURL(url), 1000);
}

/**
 * NOTA (nov/2026): o visualizador usa todas as rotas de imagem da API: os
 * tamanhos de cada tipo (GET /images/sizes), a imagem em base64 no tamanho e
 * na qualidade escolhidos (GET /image/{size}/{endpoint} e /image/{endpoint}),
 * a URL do CDN (GET /images/info/{endpoint}) e o download do arquivo
 * (format=binary). Todas são 🔒: por isso a imagem passa pelo httpClient, e
 * não por um <img src> direto na API.
 */
export function ImageViewer({images, startIndex, type, title, onClose}: {
    /** pelo menos uma imagem (a galeria vazia nem abre o visualizador) */
    images: NonEmptyArray<GalleryImage>;
    startIndex: number;
    type: ImageType;
    title: string;
    onClose: () => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const sizes: AsyncState<ImageSizesResponse> = useImageSizes();
    const [index, setIndex]: [number, Dispatch<SetStateAction<number>>] = useState<number>(startIndex);
    const [chosenSize, setChosenSize]: [ImageSize | null, Dispatch<SetStateAction<ImageSize | null>>] = useState<ImageSize | null>(null);
    const [quality, setQuality]: [number | null, Dispatch<SetStateAction<number | null>>] = useState<number | null>(null);
    const [downloading, setDownloading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [downloadError, setDownloadError]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<string | null>(null);

    const image: GalleryImage = images[index] ?? images[0];
    const preferred: ImageSize = PREFERRED_SIZE[type];
    const available: ImageSize[] = sizes.data?.supported_sizes[type] ?? [preferred, 'original'];
    const size: ImageSize = chosenSize !== null && available.includes(chosenSize)
        ? chosenSize
        : (available.includes(preferred) ? preferred : available[available.length - 1] ?? 'original');
    const qualityLimits: { min: number; max: number } = sizes.data?.quality_options ?? {min: 1, max: 100};

    const preview: AsyncState<ImageContentResponse> = useAsync<ImageContentResponse>(
        async (signal: AbortSignal): Promise<ImageContentResponse> =>
            (await getImageBase64(locale, image.path, size, {quality: quality ?? undefined}, signal)).data,
        `${image.path}|${size}|${quality ?? ''}`
    );
    const info: AsyncState<ImageInfoResponse> = useAsync<ImageInfoResponse>(
        async (signal: AbortSignal): Promise<ImageInfoResponse> => (await getImageInfo(locale, image.path, size, signal)).data,
        `${image.path}|${size}`
    );

    const download: (which: 'size' | 'original') => Promise<void> = async (which: 'size' | 'original'): Promise<void> => {
        setDownloading(true);
        setDownloadError(null);
        try {
            const options: ImageRequestOptions = {quality: quality ?? undefined};
            const blob: Blob = which === 'original' || size === 'original'
                ? await getOriginalImageBlob(locale, image.path, options)
                : await getImageBlob(locale, image.path, size, options);
            const name: string = image.path.replace(/^\/+/, '');
            saveBlob(blob, which === 'original' ? name : `${size}-${name}`);
        } catch (error: unknown) {
            setDownloadError(errorMessage(error, t('The download failed. Please try again.')));
        } finally {
            setDownloading(false);
        }
    };

    const go: (step: number) => void = (step: number): void => setIndex((current: number): number => (current + step + images.length) % images.length);

    return (
        <Modal title={title} onClose={onClose} wide>
            <div className={imageViewerClasses.layout}>
                <div className={imageViewerClasses.stage}>
                    {preview.loading && <Loader/>}
                    {preview.error !== null && <ErrorMessage error={preview.error} onRetry={preview.reload}/>}
                    {hasText(preview.data?.base64) && !preview.loading && (
                        <img className={imageViewerClasses.stageImage} src={preview.data.base64} alt={title}/>
                    )}
                    {images.length > 1 && (
                        <>
                            <button type="button" className={`${imageViewerClasses.nav} ${imageViewerClasses.navPrev}`} onClick={(): void => go(-1)} aria-label={t('Previous')}>
                                <ChevronLeft className="w-6 h-6"/>
                            </button>
                            <button type="button" className={`${imageViewerClasses.nav} ${imageViewerClasses.navNext}`} onClick={(): void => go(1)} aria-label={t('Next')}>
                                <ChevronRight className="w-6 h-6"/>
                            </button>
                            <span className={imageViewerClasses.counter}>{index + 1} / {images.length}</span>
                        </>
                    )}
                </div>

                <aside className={imageViewerClasses.side}>
                    <div>
                        <label className={imageViewerClasses.label} htmlFor="image-size">{t('Size')}</label>
                        <select
                            id="image-size"
                            className={imageViewerClasses.select}
                            value={size}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => setChosenSize(event.target.value as ImageSize)}
                        >
                            {available.map((option: ImageSize): ReactElement => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={imageViewerClasses.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={quality !== null}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => setQuality(event.target.checked ? 80 : null)}
                            />
                            {t('Re-encode JPEG quality')}
                        </label>
                        {quality !== null && (
                            <>
                                <input
                                    className={imageViewerClasses.range}
                                    type="range"
                                    min={qualityLimits.min}
                                    max={qualityLimits.max}
                                    value={quality}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setQuality(Number(event.target.value))}
                                    aria-label={t('Quality')}
                                />
                                <p className={imageViewerClasses.hint}>{t('Quality')}: {quality} · {t('Only JPEG images are re-encoded.')}</p>
                            </>
                        )}
                    </div>

                    <dl className={imageViewerClasses.facts}>
                        <div>{t('Dimensions')}: {image.width} × {image.height}</div>
                        {hasText(preview.data?.mime_type) && <div>{t('File type')}: {preview.data.mime_type}</div>}
                        {preview.data?.content_length !== null && preview.data?.content_length !== undefined && (
                            <div>{t('File size')}: {formatBytes(preview.data.content_length, locale)}</div>
                        )}
                        {info.data !== null && <div>{t('Extension')}: {info.data.file_extension}</div>}
                        {hasText(image.language) && <div>{t('Language')}: {image.language}</div>}
                    </dl>

                    <div className={imageViewerClasses.actions}>
                        <button type="button" className={imageViewerClasses.actionButton} disabled={downloading} onClick={(): void => void download('size')}>
                            <Download className="w-4 h-4"/> {t('Download this size')}
                        </button>
                        <button type="button" className={imageViewerClasses.actionButton} disabled={downloading} onClick={(): void => void download('original')}>
                            <Download className="w-4 h-4"/> {t('Download original')}
                        </button>
                        {info.data !== null && (
                            <a className={imageViewerClasses.actionLink} href={info.data.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4"/> {t('Open on the image CDN')}
                            </a>
                        )}
                        {downloading && <Loader inline/>}
                        {downloadError !== null && <p className="text-red-300">{downloadError}</p>}
                    </div>
                </aside>
            </div>
        </Modal>
    );
}
