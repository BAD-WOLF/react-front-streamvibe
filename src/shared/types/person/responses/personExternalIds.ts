// data of GET /{locale}/api/person/{personId}/external/ids (missing ids come as null)
export type PersonExternalIdsResponse = {
    person_id: number;
    imdb_id: string | null;
    wikidata_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    tiktok_id: string | null;
    twitter_id: string | null;
    youtube_id: string | null;
    freebase_mid: string | null;
    freebase_id: string | null;
    tvrage_id: number | null;
};
