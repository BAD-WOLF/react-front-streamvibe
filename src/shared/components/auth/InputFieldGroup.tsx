import * as styles from "@shared/styles/ts/login/LoginPageStyles.ts";
import type {InputField} from "@shared/types/InputField.ts";
import type {ChangeEvent, Dispatch, HTMLAttributes, ReactElement, SetStateAction} from "react";
import {cloneElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

export default function InputFieldGroup({
    id,
    type,
    placeholder,
    value,
    setter,
    icon,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    autoComplete,
}: InputField & {
    isLoading: boolean;
    showPassword?: boolean | undefined;
    setShowPassword?: ((visible: boolean) => void) | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    // NOTA (nov/2026): o foco vinha de document.activeElement durante o render e
    // nunca atualizava; agora é estado, com onFocus/onBlur.
    const [focused, setFocused]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const hasError: boolean = hasText(error);
    const attrClass: HTMLAttributes<HTMLElement> = {
        className: `${styles.iconBase} left-3`,
    };

    return (
        <div className={`${hasError ? "shake" : ""} ${styles.inputContainer(focused, hasError)}`}>
            {cloneElement(icon, attrClass)}

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                aria-label={placeholder}
                aria-invalid={hasError}
                value={value}
                autoComplete={autoComplete}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setter(e.target.value)}
                onFocus={(): void => setFocused(true)}
                onBlur={(): void => setFocused(false)}
                disabled={isLoading}
                className={styles.inputClasses(hasError)}
            />

            {id === "password" && setShowPassword !== undefined && (
                <button
                    type="button"
                    onClick={(): void => setShowPassword(showPassword !== true)}
                    className={`${styles.iconBase} right-3 cursor-pointer`}
                    aria-label={showPassword === true ? t("Hide password") : t("Show password")}
                >
                    {type === "password" ? <FaEye/> : <FaEyeSlash/>}
                </button>
            )}

            {hasError && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
}
