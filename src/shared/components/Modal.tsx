import {modalClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import {X} from 'lucide-react';
import {type MouseEvent, type ReactElement, type ReactNode, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

export function Modal({title, onClose, wide = false, children}: {
    title: string;
    onClose: () => void;
    wide?: boolean;
    children: ReactNode;
}): ReactElement {
    const {t}: Translation = useTranslation();

    useEffect((): () => void => {
        const onKeyDown: (event: KeyboardEvent) => void = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose();
        };
        const previousOverflow: string = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return (): void => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose]);

    return createPortal(
        <div className={modalClasses.backdrop} onClick={onClose}>
            <div
                className={`${modalClasses.panel} ${wide ? modalClasses.panelWide : modalClasses.panelNormal}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event: MouseEvent<HTMLDivElement>): void => event.stopPropagation()}
            >
                <div className={modalClasses.header}>
                    <h2 className={modalClasses.title}>{title}</h2>
                    <button type="button" className={modalClasses.close} onClick={onClose} aria-label={t('Close')} autoFocus>
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <div className={modalClasses.body}>{children}</div>
            </div>
        </div>,
        document.body
    );
}
