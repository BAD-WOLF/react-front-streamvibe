import {embedUrl} from '@content/movies/utils/youtube.ts';
import {Modal} from '@shared/components/Modal.tsx';
import type {MovieVideo} from '@shared/types/movie/index.ts';
import type {ReactElement} from 'react';

export function VideoModal({video, onClose}: { video: MovieVideo; onClose: () => void }): ReactElement {
    return (
        <Modal title={video.name} onClose={onClose} wide>
            <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={embedUrl(video, {autoplay: 1, rel: 0, modestbranding: 1})}
                    title={video.name}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                />
            </div>
        </Modal>
    );
}
