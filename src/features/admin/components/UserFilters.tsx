import type {Translation} from '@i18n/translation.ts';
import {roleLabel} from '@shared/auth/roleLabels.ts';
import {isRole, type Role, ROLES} from '@shared/auth/roles.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {UserListFilters} from '@shared/types/admin/index.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

const ANY: string = 'any';
const YES: string = 'yes';
const NO: string = 'no';

function toChoice(value: boolean | undefined): string {
    if (value === undefined) return ANY;
    return value ? YES : NO;
}

function fromChoice(choice: string): boolean | undefined {
    if (choice === YES) return true;
    if (choice === NO) return false;
    return undefined;
}

/**
 * Os filtros da lista de contas. O texto da busca vale ao enviar (Enter ou o
 * botão); os seletores, na hora. Quem usa remonta o componente quando a URL
 * muda (key), para o texto acompanhar.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function UserFilters({filters, onChange}: { filters: UserListFilters; onChange: (filters: UserListFilters) => void }): ReactElement {
    const {t}: Translation = useTranslation();
    const [search, setSearch]: [string, Dispatch<SetStateAction<string>>] = useState<string>(filters.search ?? '');

    const submit: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        onChange({...filters, search: search.trim() !== '' ? search.trim() : undefined});
    };
    const changeRole: (event: ChangeEvent<HTMLSelectElement>) => void = (event: ChangeEvent<HTMLSelectElement>): void => {
        const value: string = event.target.value;
        onChange({...filters, role: isRole(value) ? value : undefined});
    };

    return (
        <form className={adminClasses.filters} onSubmit={submit} role="search">
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Email or id')}</span>
                <input
                    className={adminClasses.input}
                    type="search"
                    value={search}
                    maxLength={180}
                    placeholder={t('Part of the email, or the id')}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setSearch(event.target.value)}
                />
            </label>
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Account role')}</span>
                <select className={adminClasses.input} value={filters.role ?? ANY} onChange={changeRole}>
                    <option value={ANY}>{t('All roles')}</option>
                    {ROLES.map((role: Role): ReactElement => <option key={role} value={role}>{roleLabel(t, role)}</option>)}
                </select>
            </label>
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Email confirmation')}</span>
                <select
                    className={adminClasses.input}
                    value={toChoice(filters.verified)}
                    onChange={(event: ChangeEvent<HTMLSelectElement>): void => onChange({...filters, verified: fromChoice(event.target.value)})}
                >
                    <option value={ANY}>{t('Any email status')}</option>
                    <option value={YES}>{t('Confirmed')}</option>
                    <option value={NO}>{t('Not confirmed yet')}</option>
                </select>
            </label>
            <label className={adminClasses.field}>
                <span className={adminClasses.label}>{t('Block status')}</span>
                <select
                    className={adminClasses.input}
                    value={toChoice(filters.blocked)}
                    onChange={(event: ChangeEvent<HTMLSelectElement>): void => onChange({...filters, blocked: fromChoice(event.target.value)})}
                >
                    <option value={ANY}>{t('Any block status')}</option>
                    <option value={YES}>{t('Blocked')}</option>
                    <option value={NO}>{t('Not blocked')}</option>
                </select>
            </label>
            <button type="submit" className={adminClasses.button}>{t('Apply')}</button>
        </form>
    );
}
