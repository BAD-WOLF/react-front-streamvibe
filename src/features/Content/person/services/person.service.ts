import {type Locale, toLanguageTag} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    PersonDetailsResponse, PersonExternalIdsResponse, PersonImagesResponse, PersonMovieCreditsResponse,
    PersonTvCreditsResponse
} from '@shared/types/person/index.ts';

/** GET /{locale}/api/person/{personId}/details (🔒) */
export async function getPersonDetails(locale: Locale, personId: number, signal?: AbortSignal): Promise<ApiResult<PersonDetailsResponse>> {
    return apiRequest<PersonDetailsResponse>(locale, `/person/${personId}/details`, {auth: true, signal, query: {language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/person/{personId}/external/ids (🔒, no language) */
export async function getPersonExternalIds(locale: Locale, personId: number, signal?: AbortSignal): Promise<ApiResult<PersonExternalIdsResponse>> {
    return apiRequest<PersonExternalIdsResponse>(locale, `/person/${personId}/external/ids`, {auth: true, signal});
}

/** GET /{locale}/api/person/{personId}/images (🔒, no language) */
export async function getPersonImages(locale: Locale, personId: number, signal?: AbortSignal): Promise<ApiResult<PersonImagesResponse>> {
    return apiRequest<PersonImagesResponse>(locale, `/person/${personId}/images`, {auth: true, signal});
}

/** GET /{locale}/api/person/{personId}/movie/credits (🔒) */
export async function getPersonMovieCredits(locale: Locale, personId: number, signal?: AbortSignal): Promise<ApiResult<PersonMovieCreditsResponse>> {
    return apiRequest<PersonMovieCreditsResponse>(locale, `/person/${personId}/movie/credits`, {auth: true, signal, query: {language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/person/{personId}/tv/credits (🔒) */
export async function getPersonTvCredits(locale: Locale, personId: number, signal?: AbortSignal): Promise<ApiResult<PersonTvCreditsResponse>> {
    return apiRequest<PersonTvCreditsResponse>(locale, `/person/${personId}/tv/credits`, {auth: true, signal, query: {language: toLanguageTag(locale)}});
}
