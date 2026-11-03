// path {size} of GET /{locale}/api/image/{size}/{endpoint}
export type ImageSize = 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'h632' | 'original';

// query "format" of the image routes
export type ImageFormat = 'binary' | 'base64' | 'url';

// keys of supported_sizes in GET /{locale}/api/images/sizes
export type ImageType = 'poster' | 'backdrop' | 'logo' | 'profile' | 'still';

export type ImageRequestOptions = {
    /** 1 to 100: re-encodes JPEG images (without it the image comes as is). */
    quality?: number | undefined;
    /** format=binary only: false asks for Cache-Control: no-cache. */
    cache?: boolean | undefined;
};
