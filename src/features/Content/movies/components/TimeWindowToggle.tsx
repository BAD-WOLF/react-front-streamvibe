import {homeClasses} from '@shared/styles/ts/home/HomeStyles.ts';
import type {TrendingTimeWindow} from '@shared/types/movie/index.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

const WINDOWS: TrendingTimeWindow[] = ['day', 'week'];

/** {timeWindow} de GET /movies/trending/{timeWindow}: em alta hoje ou na semana. */
export function TimeWindowToggle({value, onChange}: {
    value: TrendingTimeWindow;
    onChange: (value: TrendingTimeWindow) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const labels: Record<TrendingTimeWindow, string> = {day: t('Today'), week: t('This week')};

    return (
        <div className={homeClasses.timeWindow} role="group" aria-label={t('Trending period')}>
            {WINDOWS.map((option: TrendingTimeWindow): ReactElement => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={option === value}
                    className={`${homeClasses.timeWindowOption} ${option === value ? homeClasses.timeWindowActive : homeClasses.timeWindowInactive}`}
                    onClick={(): void => onChange(option)}
                >
                    {labels[option]}
                </button>
            ))}
        </div>
    );
}
