import {auditActionLabel} from '@admin/utils/auditLabels.ts';
import type {Translation} from '@i18n/translation.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import {AUDIT_ACTIONS, type AuditAction, type AuditLogFilters, isAuditAction} from '@shared/types/admin/index.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

const ALL: string = 'all';

/**
 * Os filtros do log de auditoria: a ação (na hora) e a conta (o id, ao
 * enviar). Quem usa remonta o componente quando a URL muda (key).
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function AuditLogFilterForm({filters, onChange}: { filters: AuditLogFilters; onChange: (filters: AuditLogFilters) => void }): ReactElement {
    const {t}: Translation = useTranslation();
    const [userId, setUserId]: [string, Dispatch<SetStateAction<string>>] = useState<string>(filters.user_id !== undefined ? String(filters.user_id) : '');

    const submit: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const id: number = Number(userId);
        onChange({...filters, user_id: Number.isInteger(id) && id > 0 ? id : undefined});
    };
    const changeAction: (event: ChangeEvent<HTMLSelectElement>) => void = (event: ChangeEvent<HTMLSelectElement>): void => {
        const value: string = event.target.value;
        onChange({...filters, action: isAuditAction(value) ? value : undefined});
    };

    return (
        <form className={adminClasses.filters} onSubmit={submit}>
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Action')}</span>
                <select className={adminClasses.input} value={filters.action ?? ALL} onChange={changeAction}>
                    <option value={ALL}>{t('All actions')}</option>
                    {AUDIT_ACTIONS.map((action: AuditAction): ReactElement => <option key={action} value={action}>{auditActionLabel(t, action)}</option>)}
                </select>
            </label>
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Account id')}</span>
                <input
                    className={adminClasses.input}
                    type="number"
                    min={1}
                    value={userId}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setUserId(event.target.value)}
                />
            </label>
            <button type="submit" className={adminClasses.button}>{t('Apply')}</button>
        </form>
    );
}
