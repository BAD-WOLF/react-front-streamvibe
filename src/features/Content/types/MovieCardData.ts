// What a MovieCard shows: a movie of a list, a credit of a person (movie or TV)...
export type MovieCardData = {
    key: string;
    title: string;
    imageUrl: string | null;
    year: number | null;
    /** rating_percentage (0 to 100); null when nobody voted yet */
    rating: number | null;
    /** character, job, number of episodes... */
    subtitle?: string | null | undefined;
    /** link to the details page (TV shows have none in the API) */
    to?: string | undefined;
};
