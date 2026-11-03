import {getImageSizes} from '@content/images/services/image.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {ImageSizesResponse} from '@shared/types/image/index.ts';

// Os tamanhos não mudam durante a sessão: uma chamada só para todo o app.
let cached: Promise<ImageSizesResponse> | null = null;

export function useImageSizes(): AsyncState<ImageSizesResponse> {
    const locale: Locale = useLocale();

    return useAsync<ImageSizesResponse>((): Promise<ImageSizesResponse> => {
        cached ??= getImageSizes(locale)
            .then(({data}: ApiResult<ImageSizesResponse>): ImageSizesResponse => data)
            .catch((error: unknown): never => {
                cached = null;
                throw error;
            });
        return cached;
    }, 'image-sizes');
}
