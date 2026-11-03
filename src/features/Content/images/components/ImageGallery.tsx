import {ImageViewer} from '@content/images/components/ImageViewer.tsx';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {imageGalleryClasses} from '@shared/styles/ts/images/ImageViewerStyles.ts';
import type {ImageType} from '@shared/types/image/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import {hasText, isNonEmpty} from '@shared/utils/guards.ts';

export type GalleryImage = {
    /** file_path do TMDB ("/abc.jpg") */
    path: string;
    thumbUrl: string | null;
    width: number;
    height: number;
    language: string | null;
};

const PAGE_SIZE: number = 24;

export function ImageGallery({images, type, title}: {
    images: GalleryImage[];
    type: ImageType;
    title: string;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const [visible, setVisible]: [number, Dispatch<SetStateAction<number>>] = useState<number>(PAGE_SIZE);
    const [openIndex, setOpenIndex]: [number | null, Dispatch<SetStateAction<number | null>>] = useState<number | null>(null);

    if (!isNonEmpty(images)) return <EmptyState>{t('No images.')}</EmptyState>;

    const isLogo: boolean = type === 'logo';

    return (
        <>
            <div className={`${imageGalleryClasses.grid} ${imageGalleryClasses.gridColumns[type]}`}>
                {images.slice(0, visible).map((image: GalleryImage, index: number): ReactElement => (
                    <button
                        key={image.path}
                        type="button"
                        className={`${imageGalleryClasses.item} ${isLogo ? imageGalleryClasses.itemLogo : ''}`}
                        style={isLogo ? undefined : {aspectRatio: `${image.width} / ${image.height}`}}
                        onClick={(): void => setOpenIndex(index)}
                        aria-label={`${title} ${index + 1}`}
                    >
                        {hasText(image.thumbUrl) && (
                            <img
                                className={isLogo ? imageGalleryClasses.imageLogo : imageGalleryClasses.image}
                                src={image.thumbUrl}
                                alt={`${title} ${index + 1}`}
                                loading="lazy"
                            />
                        )}
                        {hasText(image.language) && <span className={imageGalleryClasses.language}>{image.language}</span>}
                    </button>
                ))}
            </div>

            {visible < images.length && (
                <button type="button" className={imageGalleryClasses.more} onClick={(): void => setVisible(visible + PAGE_SIZE)}>
                    {t('Show more images')} ({images.length - visible})
                </button>
            )}

            {openIndex !== null && (
                <ImageViewer images={images} startIndex={openIndex} type={type} title={title} onClose={(): void => setOpenIndex(null)}/>
            )}
        </>
    );
}
