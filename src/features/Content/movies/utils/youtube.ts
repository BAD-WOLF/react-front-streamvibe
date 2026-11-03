import type {MovieVideo, MovieVideosResponse} from '@shared/types/movie/index.ts';

function isPlayable(video: MovieVideo): boolean {
    return video.site === 'YouTube' && Boolean(video.youtube_embed_url);
}

/** O melhor vídeo para "assistir ao trailer": trailer oficial, trailer, teaser ou qualquer vídeo do YouTube. */
export function pickTrailer(videos: MovieVideosResponse): MovieVideo | null {
    const trailers: MovieVideo[] = videos.trailers.filter(isPlayable);
    return trailers.find((video: MovieVideo): boolean => video.official)
        ?? trailers[0]
        ?? videos.teasers.find(isPlayable)
        ?? videos.videos.find(isPlayable)
        ?? null;
}

/** O youtube_embed_url da API com os parâmetros do player. */
export function embedUrl(video: MovieVideo, params: Record<string, string | number>): string {
    const url: URL = new URL(video.youtube_embed_url ?? `https://www.youtube.com/embed/${video.key}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
    return url.toString();
}

export function youtubeThumbnail(video: MovieVideo): string | null {
    return video.site === 'YouTube' ? `https://i.ytimg.com/vi/${encodeURIComponent(video.key)}/hqdefault.jpg` : null;
}
