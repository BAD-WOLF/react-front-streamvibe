import {CategorySection} from '@content/home/components/CategorySection.tsx';
import {NetflixHeroBanner} from '@content/home/components/NetflixHeroBanner.tsx';
import {getMovieListService} from '@content/services/movieList.service.ts';
import {Footer} from '@layout/Footer.tsx';
import {Header} from '@layout/Header.tsx';
import {homeClasses, homeStyles} from '@shared/styles/ts/home/HomeStyles.ts';
import type {Movie} from '@shared/types/Movie.ts'
import {t} from 'i18next';
import type {FC, ReactElement} from 'react';

export const Home: FC = (): ReactElement => {
    const featuredMovies: Movie[] = getMovieListService();

    return (
        <div
            className={homeClasses.container}
            style={{
                background: homeStyles.background,
            }}
        >
            {/* Header */}
            <Header/>

            {/* Netflix-Style Hero Banner */}
            <NetflixHeroBanner movies={featuredMovies}/>

            {/* Category Sections - Sem espaçamento desnecessário */}
            <div className={homeClasses.categorySection}>
                <CategorySection title={t('Trending Now')} movieCount={10}/>
                <CategorySection title={t('New Releases')} movieCount={10}/>
                <CategorySection title={t('Sci-Fi Realms')} movieCount={10}/>
                <CategorySection title={t('Action & Thriller')} movieCount={10}/>
                <CategorySection title={t('Drama & Romance')} movieCount={10}/>
                <CategorySection title={t('Horror & Mystery')} movieCount={10}/>
                <CategorySection title={t('Comedy & Adventure')} movieCount={10}/>
                <CategorySection title={t('Documentaries')} movieCount={10}/>
                <CategorySection title={t('Anime & Animation')} movieCount={10}/>
                <CategorySection title={t('Classic Cinema')} movieCount={10}/>
            </div>

            {/* Footer */}
            <Footer/>
        </div>
    );
}
