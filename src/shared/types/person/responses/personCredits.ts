type CreditBase = {
    id: number;
    credit_id: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
    genre_ids: number[];
    original_language: string;
    overview: string;
    poster_url: string | null;
    backdrop_url: string | null;
    rating_percentage: number;
};

type MovieCreditBase = CreditBase & {
    title: string;
    original_title: string;
    release_date: string | null;
    video: boolean;
    release_year: number | null;
};

type TvCreditBase = CreditBase & {
    name: string;
    original_name: string;
    episode_count: number;
    first_air_date: string | null;
    origin_country: string[];
    first_air_year: number | null;
};

export type MovieCastCredit = MovieCreditBase & {
    character: string;
    order: number;
};

export type MovieCrewCredit = MovieCreditBase & {
    job: string;
    department: string;
};

export type TvCastCredit = TvCreditBase & {
    character: string;
};

export type TvCrewCredit = TvCreditBase & {
    job: string;
    department: string;
};

// data of GET /{locale}/api/person/{personId}/movie/credits
export type PersonMovieCreditsResponse = {
    person_id: number;
    cast: MovieCastCredit[];
    crew: MovieCrewCredit[];
};

// data of GET /{locale}/api/person/{personId}/tv/credits
export type PersonTvCreditsResponse = {
    person_id: number;
    cast: TvCastCredit[];
    crew: TvCrewCredit[];
};
