import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import type {ReactElement, ReactNode} from 'react';

export type NoticeTone = keyof typeof feedbackClasses.noticeTones;

export function Notice({tone = 'info', children}: { tone?: NoticeTone; children: ReactNode }): ReactElement {
    return (
        <div className={`${feedbackClasses.notice} ${feedbackClasses.noticeTones[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
            {children}
        </div>
    );
}
