import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import type {ReactElement, ReactNode} from 'react';

export function EmptyState({children}: { children: ReactNode }): ReactElement {
    return <div className={feedbackClasses.emptyContainer}>{children}</div>;
}
