import type {ImageFormat, ImageSize, ImageType} from '@shared/types/image/params/imageParams.ts';

// data of GET /image/{size}/{endpoint} and /image/{endpoint} with format=base64
export type ImageContentResponse = {
    endpoint: string;
    size: string;
    format: string;
    mime_type: string | null;
    content_length: number | null;
    url: string;
    /** data URI ("data:image/jpeg;base64,..."), ready for <img src>. */
    base64: string | null;
};

// data of GET /{locale}/api/images/info/{endpoint}
export type ImageInfoResponse = {
    endpoint: string;
    size: string;
    url: string;
    file_extension: string;
};

// data of GET /{locale}/api/images/sizes
export type ImageSizesResponse = {
    supported_sizes: Record<ImageType, ImageSize[]>;
    supported_formats: ImageFormat[];
    cache_enabled: boolean;
    quality_options: {
        min: number;
        max: number;
    };
    usage_examples: Record<string, string>;
};
