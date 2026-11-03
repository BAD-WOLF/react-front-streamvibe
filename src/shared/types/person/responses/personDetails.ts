// data of GET /{locale}/api/person/{personId}/details
export type PersonDetailsResponse = {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    known_for_department: string | null;
    popularity: number;
    gender: number;
    adult: boolean;
    also_known_as: string[];
    homepage: string | null;
    imdb_id: string | null;
    profile_url: string | null;
    profile_large_url: string | null;
    profile_original_url: string | null;
    formatted_biography: string | null;
    age: number | null;
    is_alive: boolean;
    gender_display: string;
    birth_year: number | null;
    death_year: number | null;
    formatted_birth_date: string | null;
    formatted_death_date: string | null;
};
