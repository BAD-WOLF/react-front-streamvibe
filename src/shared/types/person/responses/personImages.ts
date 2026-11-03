export type PersonImage = {
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
    iso_639_1: string | null;
    url_original: string | null;
    url_w185: string | null;
    url_h632: string | null;
};

// data of GET /{locale}/api/person/{personId}/images
export type PersonImagesResponse = {
    person_id: number;
    profiles: PersonImage[];
};
