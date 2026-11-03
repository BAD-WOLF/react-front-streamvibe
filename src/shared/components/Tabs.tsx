import {tabsClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import type {ReactElement} from 'react';

export type TabItem<T extends string> = {
    id: T;
    label: string;
    count?: number | undefined;
};

export function Tabs<T extends string>({tabs, active, onChange}: {
    tabs: TabItem<T>[];
    active: T;
    onChange: (id: T) => void;
}): ReactElement {
    return (
        <div className={tabsClasses.list} role="tablist">
            {tabs.map((tab: TabItem<T>): ReactElement => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={tab.id === active}
                    className={`${tabsClasses.tab} ${tab.id === active ? tabsClasses.tabActive : tabsClasses.tabInactive}`}
                    onClick={(): void => onChange(tab.id)}
                >
                    {tab.label}
                    {tab.count !== undefined && <span className={tabsClasses.count}>{tab.count}</span>}
                </button>
            ))}
        </div>
    );
}
