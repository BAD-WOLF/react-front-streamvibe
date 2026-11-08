// src/features/auth/login-register/components/AuthForm.tsx
import {useAuthForm} from "@auth/login-register/hooks/useAuthForm.ts";
import {AuthMode} from "@auth/login-register/types/AuthMode.ts";
import type {RegistrationResult} from "@auth/login-register/types/RegistrationResult.ts";
import type {UseAuthFormReturn} from "@auth/login-register/types/UseAuthFormReturn.ts";
import ResendVerificationForm from "@auth/verify-email/components/ResendVerificationForm.tsx";
import type {Locale} from "@i18n/locales.ts";
import InputFieldGroup from "@shared/components/auth/InputFieldGroup.tsx";
import PasswordStrengthBar from "@shared/components/auth/PasswordStrengthBar.tsx";
import {ErrorMessage} from "@shared/components/feedback/ErrorMessage.tsx";
import {type AuthLocationState, paths} from "@shared/routing/paths.ts";
import {authClasses} from "@shared/styles/ts/login/AuthStyles.ts";
import * as styles from "@shared/styles/ts/login/LoginPageStyles.ts";
import type {InputField} from "@shared/types/InputField.ts";
import {type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction, useState} from "react";
import {useTranslation} from "react-i18next";
import {FaEnvelope, FaLock} from "react-icons/fa";
import {Link} from "react-router-dom";
import type {Translation} from '@i18n/translation.ts';
import {textOr} from '@shared/utils/guards.ts';

export default function AuthForm({
    onLoggedIn,
    onRegistered,
    locale,
    mode,
    initialEmail,
}: {
    onLoggedIn: () => void;
    onRegistered: (result: RegistrationResult) => void;
    locale: Locale;
    mode: AuthMode;
    initialEmail?: string | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const [showResend, setShowResend]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const {
        email,
        password,
        confirmPassword,
        agreeTerms,
        errors,
        apiError,
        strength,
        showPassword,
        isLoading,
        setEmail,
        setPassword,
        setConfirmPassword,
        setAgreeTerms,
        setShowPassword,
        handleSubmit,
    }: UseAuthFormReturn = useAuthForm(onLoggedIn, onRegistered, locale, mode, initialEmail);

    const isRegister: boolean = mode === AuthMode.Register;
    const fields: InputField[] = [
        {
            id: "email",
            type: "email",
            placeholder: t("Email address"),
            value: email,
            setter: setEmail,
            icon: <FaEnvelope/>,
            error: errors.email,
            autoComplete: "email",
        },
        {
            id: "password",
            type: showPassword ? "text" : "password",
            placeholder: t("Tell me your password"),
            value: password,
            setter: setPassword,
            icon: <FaLock/>,
            error: errors.password,
            autoComplete: isRegister ? "new-password" : "current-password",
        },
        ...(isRegister
            ? [{
                id: "confirmPassword",
                type: showPassword ? "text" : "password",
                placeholder: t("Confirm Password"),
                value: confirmPassword,
                setter: setConfirmPassword,
                icon: <FaLock/>,
                error: errors.confirmPassword,
                autoComplete: "new-password",
            } satisfies InputField]
            : []),
    ];

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                {fields.map((field: InputField): ReactElement => (
                    <InputFieldGroup
                        key={field.id}
                        {...field}
                        isLoading={isLoading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                    />
                ))}

                {isRegister && password !== "" && <PasswordStrengthBar strength={strength}/>}

                {isRegister && (
                    <>
                        <label className={authClasses.checkbox}>
                            <input
                                type="checkbox"
                                className={authClasses.checkboxInput}
                                checked={agreeTerms}
                                disabled={isLoading}
                                onChange={(e: ChangeEvent<HTMLInputElement>): void => setAgreeTerms(e.target.checked)}
                            />
                            <span>{t("I agree to the terms of use and the privacy policy.")}</span>
                        </label>
                        {errors.agreeTerms !== undefined && <p className={authClasses.fieldError}>{errors.agreeTerms}</p>}
                    </>
                )}

                {apiError !== null && <ErrorMessage error={apiError}/>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`${styles.buttonBase} ${styles.gradients.gradiente1} text-white disabled:opacity-60`}
                >
                    {isLoading ? t("Please wait...") : isRegister ? t("Register") : t("Log In")}
                </button>
            </form>

            {!isRegister && (
                <div className={authClasses.linkRow}>
                    <Link className={authClasses.link} to={paths.repassword(locale)} state={{email: textOr(email.trim(), undefined)} satisfies AuthLocationState}>
                        {t("Forgot your password?")}
                    </Link>
                    <button type="button" className={authClasses.link} onClick={(): void => setShowResend(!showResend)}>
                        {t("Didn't get the confirmation email?")}
                    </button>
                </div>
            )}

            {!isRegister && showResend && <ResendVerificationForm initialEmail={email} onAlreadyVerified={(): void => setShowResend(false)}/>}
        </>
    );
}
