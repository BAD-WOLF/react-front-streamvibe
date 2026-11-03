export type MovieImage = {
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
    iso_639_1: string | null;
    url_original: string | null;
    url_w500: string | null;
    url_w780: string | null;
};

// data of GET /{locale}/api/movies/{movieId}/images
export type MovieImagesResponse = {
    movie_id: number;
    backdrops: MovieImage[];
    posters: MovieImage[];
    logos: MovieImage[];
};
