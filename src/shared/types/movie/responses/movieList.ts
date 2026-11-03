import type {Pagination} from '@shared/types/api/envelope.ts';

// item of every movie list (search, trending, popular, top rated, now playing, similar, recommendations)
export type MovieListItem = {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    release_date: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    adult: boolean;
    video: boolean;
    original_language: string;
    poster_url: string | null;
    backdrop_url: string | null;
    thumbnail_url: string | null;
    rating_percentage: number;
    release_year: number | null;
    formatted_overview: string | null;
};

// data of search, popular, top-rated and now-playing
export type MovieListResponse = Pagination & {
    movies: MovieListItem[];
};

// data of GET /movies/trending/{timeWindow}
export type TrendingMoviesResponse = MovieListResponse & {
    time_window: string;
};

// data of GET /movies/{movieId}/similar and /recommendations
export type RelatedMoviesResponse = MovieListResponse & {
    movie_id: number;
};
