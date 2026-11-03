import {personDetailsClasses} from '@shared/styles/ts/person/PersonDetailsStyles.ts';
import type {PersonExternalIdsResponse} from '@shared/types/person/index.ts';
import {Globe} from 'lucide-react';
import type {ReactElement} from 'react';
import {FaFacebook, FaImdb, FaInstagram, FaTiktok, FaTwitter, FaYoutube} from 'react-icons/fa';
import {hasText} from '@shared/utils/guards.ts';

type ExternalLink = {
    label: string;
    href: string;
    icon: ReactElement;
};

/** Os ids da pessoa em outros sites (GET /person/{id}/external/ids), como links. */
export function ExternalLinks({ids, homepage}: { ids: PersonExternalIdsResponse | null; homepage: string | null }): ReactElement | null {
    const links: ExternalLink[] = [
        hasText(homepage) ? {label: 'Site', href: homepage, icon: <Globe className="w-4 h-4"/>} : null,
        hasText(ids?.imdb_id) ? {label: 'IMDb', href: `https://www.imdb.com/name/${ids.imdb_id}/`, icon: <FaImdb/>} : null,
        hasText(ids?.wikidata_id) ? {label: 'Wikidata', href: `https://www.wikidata.org/wiki/${ids.wikidata_id}`, icon: <Globe className="w-4 h-4"/>} : null,
        hasText(ids?.instagram_id) ? {label: 'Instagram', href: `https://www.instagram.com/${ids.instagram_id}/`, icon: <FaInstagram/>} : null,
        hasText(ids?.facebook_id) ? {label: 'Facebook', href: `https://www.facebook.com/${ids.facebook_id}`, icon: <FaFacebook/>} : null,
        hasText(ids?.twitter_id) ? {label: 'X', href: `https://x.com/${ids.twitter_id}`, icon: <FaTwitter/>} : null,
        hasText(ids?.tiktok_id) ? {label: 'TikTok', href: `https://www.tiktok.com/@${ids.tiktok_id}`, icon: <FaTiktok/>} : null,
        hasText(ids?.youtube_id) ? {label: 'YouTube', href: `https://www.youtube.com/${ids.youtube_id}`, icon: <FaYoutube/>} : null,
    ].filter((link: ExternalLink | null): link is ExternalLink => link !== null);

    if (links.length === 0) return null;

    return (
        <div className={personDetailsClasses.links}>
            {links.map((link: ExternalLink): ReactElement => (
                <a key={link.label} className={personDetailsClasses.link} href={link.href} target="_blank" rel="noreferrer">
                    {link.icon} {link.label}
                </a>
            ))}
        </div>
    );
}
