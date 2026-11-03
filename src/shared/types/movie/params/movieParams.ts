// path {timeWindow} of GET /{locale}/api/movies/trending/{timeWindow}
export type TrendingTimeWindow = 'day' | 'week';

// the movie lists of the API, as they appear in the front's URL (/movies/list/{list})
export type MovieListName = 'trending' | 'popular' | 'top-rated' | 'now-playing';

// optional filters of GET /{locale}/api/movies/search/{query}/{page}
export type MovieSearchFilters = {
    includeAdult?: boolean | undefined;
    /** ISO 3166-1, two capital letters (e.g. "BR"). */
    region?: string | undefined;
    /** 1874 to 2100 */
    year?: number | undefined;
    /** 1874 to 2100 */
    primaryReleaseYear?: number | undefined;
};
