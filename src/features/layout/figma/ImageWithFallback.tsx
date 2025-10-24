import React, {type ReactElement, useState} from 'react'
import {imageWithFallbackClasses, imageWithFallbackConstants} from '../../../shared/styles/ts/layout/ImageWithFallbackStyles.ts';

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>): ReactElement {
    const [didError, setDidError]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(
        false)

    const handleError: () => void = (): void => {
        setDidError(true)
    }

    const {src, alt, style, className, ...rest}: React.ImgHTMLAttributes<HTMLImageElement> = props

    return didError ? (
        <div
            className={`${imageWithFallbackClasses.errorContainer} ${className ?? ''}`}
            style={style}
        >
            <div className={imageWithFallbackClasses.errorContent}>
                <img src={imageWithFallbackConstants.ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src}/>
            </div>
        </div>
    ) : (
        <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError}/>
    )
}
