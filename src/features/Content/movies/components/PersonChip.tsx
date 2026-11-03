import {useImageUrl} from '@content/images/hooks/useImageUrl.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import {initialsOf} from '@shared/utils/format.ts';
import type {ReactElement} from 'react';
import {Link} from 'react-router-dom';
import {hasText} from '@shared/utils/guards.ts';

/** Uma pessoa do elenco: foto (profile_path), nome e papel, com link para a página dela. */
export function PersonChip({name, role, profilePath, to}: {
    name: string;
    role: string | null;
    profilePath: string | null;
    to: string;
}): ReactElement {
    const photoUrl: string | null = useImageUrl(profilePath, 'w185');

    return (
        <div className={movieDetailsClasses.person}>
            <Link to={to} className={movieDetailsClasses.personLink}>
                {photoUrl !== null
                    ? <img className={movieDetailsClasses.personPhoto} src={photoUrl} alt={name} loading="lazy"/>
                    : <span className={movieDetailsClasses.personInitials}>{initialsOf(name.replace(/\s+/g, '.'))}</span>}
                <p className={movieDetailsClasses.personName}>{name}</p>
                {hasText(role) && <p className={movieDetailsClasses.personRole}>{role}</p>}
            </Link>
        </div>
    );
}
