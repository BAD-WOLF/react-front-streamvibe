import {toImageEndpoint} from '@content/images/utils/imagePath.ts';
import type {Locale} from '@i18n/locales.ts';
import {apiRequest, apiRequestBlob} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    ImageContentResponse, ImageInfoResponse, ImageRequestOptions, ImageSize, ImageSizesResponse
} from '@shared/types/image/index.ts';

/**
 * The image as a data URI, in a TMDB size: GET /{locale}/api/image/{size}/{endpoint}?format=base64
 * ("original" uses GET /{locale}/api/image/{endpoint}?format=base64).
 */
export async function getImageBase64(locale: Locale, path: string, size: ImageSize, options: ImageRequestOptions = {}, signal?: AbortSignal): Promise<ApiResult<ImageContentResponse>> {
    const endpoint: string = toImageEndpoint(path);
    const route: string = size === 'original' ? `/image/${endpoint}` : `/image/${size}/${endpoint}`;
    return apiRequest<ImageContentResponse>(locale, route, {auth: true, signal, query: {format: 'base64', quality: options.quality}});
}

/** The image file in a TMDB size: GET /{locale}/api/image/{size}/{endpoint}?format=binary */
export async function getImageBlob(locale: Locale, path: string, size: ImageSize, options: ImageRequestOptions = {}): Promise<Blob> {
    return apiRequestBlob(locale, `/image/${size}/${toImageEndpoint(path)}`, {
        auth: true,
        query: {format: 'binary', quality: options.quality, cache: options.cache === false ? false : undefined},
    });
}

/** The image file in its original size: GET /{locale}/api/image/{endpoint} (binary by default) */
export async function getOriginalImageBlob(locale: Locale, path: string, options: ImageRequestOptions = {}): Promise<Blob> {
    return apiRequestBlob(locale, `/image/${toImageEndpoint(path)}`, {
        auth: true,
        query: {quality: options.quality, cache: options.cache === false ? false : undefined},
    });
}

/** CDN URL and extension of the image, without downloading it: GET /{locale}/api/images/info/{endpoint} */
export async function getImageInfo(locale: Locale, path: string, size: ImageSize = 'original', signal?: AbortSignal): Promise<ApiResult<ImageInfoResponse>> {
    return apiRequest<ImageInfoResponse>(locale, `/images/info/${toImageEndpoint(path)}`, {auth: true, signal, query: {size}});
}

/** Sizes per image type, formats and quality limits: GET /{locale}/api/images/sizes */
export async function getImageSizes(locale: Locale, signal?: AbortSignal): Promise<ApiResult<ImageSizesResponse>> {
    return apiRequest<ImageSizesResponse>(locale, '/images/sizes', {auth: true, signal});
}
