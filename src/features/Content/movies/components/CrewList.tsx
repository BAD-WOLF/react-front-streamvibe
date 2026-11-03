import type {Locale} from '@i18n/locales.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {CrewMember} from '@shared/types/movie/index.ts';
import {Fragment, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';

// As funções que mais interessam a quem vê o filme, nesta ordem (o `job` vem do TMDB, em inglês).
type CrewGroup = {
    job: string;
    people: CrewMember[];
};

const KEY_JOBS: string[] = ['Director', 'Screenplay', 'Writer', 'Story', 'Novel', 'Producer', 'Original Music Composer', 'Director of Photography', 'Editor'];

export function CrewList({crew}: { crew: CrewMember[] }): ReactElement | null {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const labels: Record<string, string> = {
        'Director': t('Directed by'),
        'Screenplay': t('Screenplay'),
        'Writer': t('Written by'),
        'Story': t('Story by'),
        'Novel': t('Based on the novel by'),
        'Producer': t('Produced by'),
        'Original Music Composer': t('Music by'),
        'Director of Photography': t('Cinematography'),
        'Editor': t('Edited by'),
    };

    const groups: CrewGroup[] = KEY_JOBS
        .map((job: string): CrewGroup => ({job, people: crew.filter((member: CrewMember): boolean => member.job === job)}))
        .filter((group: { people: CrewMember[] }): boolean => group.people.length > 0);

    if (groups.length === 0) return null;

    return (
        <div className={movieDetailsClasses.crew}>
            {groups.map(({job, people}: CrewGroup): ReactElement => (
                <div key={job} className={movieDetailsClasses.crewItem}>
                    <p className={movieDetailsClasses.crewJob}>{labels[job] ?? job}</p>
                    <p className={movieDetailsClasses.crewNames}>
                        {people.map((member: CrewMember, index: number): ReactElement => (
                            <Fragment key={member.credit_id}>
                                {index > 0 && ', '}
                                <Link className={movieDetailsClasses.crewName} to={paths.person(locale, member.id)}>{member.name}</Link>
                            </Fragment>
                        ))}
                    </p>
                </div>
            ))}
        </div>
    );
}
