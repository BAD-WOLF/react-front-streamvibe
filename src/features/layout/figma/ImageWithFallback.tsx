import {imageWithFallbackClasses, imageWithFallbackConstants} from '@shared/styles/ts/layout/ImageWithFallbackStyles.ts';
import {hasText} from '@shared/utils/guards.ts';
import {type Dispatch, type ImgHTMLAttributes, type ReactElement, type SetStateAction, useState} from 'react';

export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>): ReactElement {
    const [didError, setDidError]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const {src, alt, style, className, ...rest}: ImgHTMLAttributes<HTMLImageElement> = props;

    return didError || !hasText(src) ? (
        <div
            className={`${imageWithFallbackClasses.errorContainer} ${className ?? ''}`}
            style={style}
        >
            <div className={imageWithFallbackClasses.errorContent}>
                <img src={imageWithFallbackConstants.ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src}/>
            </div>
        </div>
    ) : (
        <img src={src} alt={alt} className={className} style={style} {...rest} onError={(): void => setDidError(true)}/>
    );
}
