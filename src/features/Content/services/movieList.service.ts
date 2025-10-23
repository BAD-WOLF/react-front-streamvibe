import type {Movie} from "@shared/types/Movie.ts";
import { t } from 'i18next';

/**
 * Returns the list of mocked movies or via fetch for FeaturedMovies
 */
export function getMovieListService(): Movie[] {
    return [
        {
          title: t('Midnight Realms'),
          description: t('An epic journey through the multiverse as our hero finds themselves in the ultimate test to save reality.'),
          poster_path: 'https://images.unsplash.com/photo-1759547020777-14a1ca4c3fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjA3MzI4MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          index: 0,
        },
        {
          title: t('Shadow Protocol'),
          description: t('When AI and humanity clash in the shadows, a lone agent is all that stands between chaos and order.'),
          poster_path: 'https://images.unsplash.com/photo-1741359013969-ef3c6ce1bc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjB0aHJpbGxlciUyMHBvc3RlcnxlbnwxfHx8fDE3NjA3MzI4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          index: 1,
        },
        {
          title: t('The Last Frontier'),
          description: t('Humanity\'s last hope lies beyond the stars in this breathtaking space exploration saga.'),
          poster_path: 'https://images.unsplash.com/photo-1578374173713-32f6ae6f3971?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2lmaSUyMHNwYWNlJTIwbW92aWV8ZW58MXx8fHwxNzYwNzMyODM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          index: 2,
        },
      ];
}
