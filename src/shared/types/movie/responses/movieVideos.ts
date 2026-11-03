export type MovieVideo = {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    size: number;
    official: boolean;
    published_at: string | null;
    youtube_url: string | null;
    youtube_embed_url: string | null;
};

// data of GET /{locale}/api/movies/{movieId}/videos
export type MovieVideosResponse = {
    movie_id: number;
    videos: MovieVideo[];
    trailers: MovieVideo[];
    teasers: MovieVideo[];
    clips: MovieVideo[];
};
