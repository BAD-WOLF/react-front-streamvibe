import {VideoModal} from '@content/movies/components/VideoModal.tsx';
import {youtubeThumbnail} from '@content/movies/utils/youtube.ts';
import type {Locale} from '@i18n/locales.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {type TabItem, Tabs} from '@shared/components/Tabs.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {MovieVideo, MovieVideosResponse} from '@shared/types/movie/index.ts';
import {formatDate} from '@shared/utils/format.ts';
import {ExternalLink, Play} from 'lucide-react';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

type VideoTab = 'trailers' | 'teasers' | 'clips' | 'videos';

/** Os vídeos do filme, nas listas que a API já separa (trailers, teasers, clipes e todos). */
export function VideoSection({videos}: { videos: MovieVideosResponse }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const tabs: TabItem<VideoTab>[] = ([
        {id: 'trailers', label: t('Trailers'), count: videos.trailers.length},
        {id: 'teasers', label: t('Teasers'), count: videos.teasers.length},
        {id: 'clips', label: t('Clips'), count: videos.clips.length},
        {id: 'videos', label: t('All videos'), count: videos.videos.length},
    ] satisfies TabItem<VideoTab>[]).filter((tab: TabItem<VideoTab>): boolean => (tab.count ?? 0) > 0);
    const [active, setActive]: [VideoTab, Dispatch<SetStateAction<VideoTab>>] = useState<VideoTab>(tabs[0]?.id ?? 'videos');
    const [playing, setPlaying]: [MovieVideo | null, Dispatch<SetStateAction<MovieVideo | null>>] = useState<MovieVideo | null>(null);

    if (tabs.length === 0) return <EmptyState>{t('No videos in this language.')}</EmptyState>;

    return (
        <>
            <Tabs tabs={tabs} active={active} onChange={setActive}/>
            <div className={movieDetailsClasses.videos}>
                {videos[active].map((video: MovieVideo): ReactElement => {
                    const thumbnail: string | null = youtubeThumbnail(video);
                    const meta: string = [video.type, video.official ? t('Official video') : null, formatDate(video.published_at, locale)]
                        .filter(Boolean).join(' · ');
                    const body: ReactElement = (
                        <>
                            <div className={movieDetailsClasses.videoThumb}>
                                {thumbnail !== null && <img className={movieDetailsClasses.videoThumbImage} src={thumbnail} alt="" loading="lazy"/>}
                                <span className={movieDetailsClasses.videoPlay}>
                                    {hasText(video.youtube_embed_url)
                                        ? <Play className={movieDetailsClasses.videoPlayIcon}/>
                                        : <ExternalLink className={movieDetailsClasses.videoPlayIcon}/>}
                                </span>
                            </div>
                            <div className={movieDetailsClasses.videoInfo}>
                                <p className={movieDetailsClasses.videoName}>{video.name}</p>
                                <p className={movieDetailsClasses.videoMeta}>{meta} · {video.site}</p>
                            </div>
                        </>
                    );

                    return hasText(video.youtube_embed_url) ? (
                        <button key={video.id} type="button" className={movieDetailsClasses.video} onClick={(): void => setPlaying(video)}>
                            {body}
                        </button>
                    ) : (
                        <a key={video.id} className={movieDetailsClasses.video} href={video.youtube_url ?? '#'} target="_blank" rel="noreferrer">
                            {body}
                        </a>
                    );
                })}
            </div>

            {playing !== null && <VideoModal video={playing} onClose={(): void => setPlaying(null)}/>}
        </>
    );
}
