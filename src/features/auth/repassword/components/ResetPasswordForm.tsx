import type {UseRepasswordReturn} from '@auth/repassword/types/UseRepasswordReturn.ts';
import type {Locale} from '@i18n/locales.ts';
import InputFieldGroup from '@shared/components/auth/InputFieldGroup.tsx';
import PasswordStrengthBar from '@shared/components/auth/PasswordStrengthBar.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {authClasses} from '@shared/styles/ts/login/AuthStyles.ts';
import * as styles from "@shared/styles/ts/login/LoginPageStyles.ts";
import type {InputField} from '@shared/types/InputField.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {FaLock} from 'react-icons/fa';
import type {Translation} from '@i18n/translation.ts';

export default function ResetPasswordForm({
    locale,
    password,
    strength,
    confirmPassword,
    errors,
    apiError,
    tokenExpiresAt,
    isLoading,
    setPassword,
    setShowPassword,
    showPassword,
    setConfirmPassword,
    handleReset,
    handleCancel,
}: { locale: Locale } & Pick<
    UseRepasswordReturn,
    | 'password'
    | 'strength'
    | 'confirmPassword'
    | 'errors'
    | 'apiError'
    | 'tokenExpiresAt'
    | 'isLoading'
    | 'setPassword'
    | 'setShowPassword'
    | 'showPassword'
    | 'setConfirmPassword'
    | 'handleReset'
    | 'handleCancel'
>): ReactElement {
    const {t}: Translation = useTranslation();
    const until: string | null = formatDateTime(tokenExpiresAt, locale);
    const fields: InputField[] = [
        {
            id: 'password',
            type: showPassword ? 'text' : 'password',
            placeholder: t('New password'),
            value: password,
            setter: setPassword,
            icon: <FaLock/>,
            error: errors.password,
            autoComplete: 'new-password',
        },
        {
            id: 'confirmPassword',
            // NOTA (nov/2026): o type era 'confirmPassword', que não existe, e a
            // confirmação aparecia em texto aberto.
            type: showPassword ? 'text' : 'password',
            placeholder: t('Confirm new password'),
            value: confirmPassword,
            setter: setConfirmPassword,
            icon: <FaLock/>,
            error: errors.confirmPassword,
            autoComplete: 'new-password',
        },
    ];

    return (
        <div className={authClasses.stack}>
            <form onSubmit={handleReset} className="space-y-4" noValidate>
                {until !== null && <p className={authClasses.text}>{t("This link works until {{date}}.", {date: until})}</p>}
                {fields.map((field: InputField): ReactElement => (
                    <InputFieldGroup
                        key={field.id}
                        {...field}
                        isLoading={isLoading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                    />
                ))}

                <PasswordStrengthBar strength={strength}/>

                {apiError !== null && <ErrorMessage error={apiError}/>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`${styles.buttonBase} bg-green-600 text-white rounded ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                >
                    {isLoading ? t('Resetting...') : t('Reset password')}
                </button>
            </form>

            <button type="button" className={authClasses.dangerButton} disabled={isLoading} onClick={handleCancel}>
                {t("I did not ask for this: cancel the link")}
            </button>
        </div>
    );
}
