import {getImageInfo} from '@content/images/services/image.service.ts';
import {toImageEndpoint} from '@content/images/utils/imagePath.ts';
import type {Locale} from '@i18n/locales.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {ImageInfoResponse, ImageSize} from '@shared/types/image/index.ts';
import {hasText} from '@shared/utils/guards.ts';
import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';

// NOTA (nov/2026): créditos e empresas trazem só o caminho (profile_path,
// logo_path), sem URL pronta. Em vez de fixar o endereço do CDN do TMDB no
// front, o endereço de cada tamanho vem uma vez do GET /images/info e fica
// guardado na memória.
const PROBE: string = 'probe.jpg';
const baseUrls: Map<ImageSize, Promise<string | null>> = new Map<ImageSize, Promise<string | null>>();

function imageBaseUrl(locale: Locale, size: ImageSize): Promise<string | null> {
    let base: Promise<string | null> | undefined = baseUrls.get(size);
    if (base === undefined) {
        base = getImageInfo(locale, PROBE, size)
            .then(({data}: ApiResult<ImageInfoResponse>): string | null => data.url.endsWith(PROBE) ? data.url.slice(0, -PROBE.length) : null)
            .catch((): null => {
                baseUrls.delete(size);
                return null;
            });
        baseUrls.set(size, base);
    }
    return base;
}

/** URL do CDN para um caminho do TMDB ("/abc.jpg") no tamanho pedido. */
export function useImageUrl(path: string | null | undefined, size: ImageSize): string | null {
    const locale: Locale = useLocale();
    const [base, setBase]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<string | null>(null);

    useEffect((): (() => void) | undefined => {
        if (!hasText(path)) return undefined;
        let active: boolean = true;
        void imageBaseUrl(locale, size).then((value: string | null): void => {
            if (active) setBase(value);
        });
        return (): void => {
            active = false;
        };
    }, [locale, size, path]);

    return hasText(path) && hasText(base) ? `${base}${toImageEndpoint(path)}` : null;
}
