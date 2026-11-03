// Visual component of the password strength bar
import {PasswordStrength} from '@auth/utils/passwordStrength.service.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

export default function PasswordStrengthBar({strength}: { strength: PasswordStrength; }): ReactElement {
    const {t}: Translation = useTranslation();
    // os cinco níveis do PasswordStrength do Symfony; a API exige pelo menos "Medium"
    const strengthLabel: Record<PasswordStrength, string> = {
        [PasswordStrength.VeryWeak]: t("Very weak"),
        [PasswordStrength.Weak]: t("Weak"),
        [PasswordStrength.Medium]: t("Medium"),
        [PasswordStrength.Strong]: t("Strong"),
        [PasswordStrength.VeryStrong]: t("Very strong"),
    };
    const strengthColor: Record<PasswordStrength, string> = {
        [PasswordStrength.VeryWeak]: "bg-red-500",
        [PasswordStrength.Weak]: "bg-orange-500",
        [PasswordStrength.Medium]: "bg-yellow-400",
        [PasswordStrength.Strong]: "bg-green-500",
        [PasswordStrength.VeryStrong]: "bg-green-600",
    };

    return (
        <div className="mb-4">
            <div className="h-1 rounded-full bg-gray-200/20 overflow-hidden">
                <div
                    className={`h-full transition-all ${strengthColor[strength]}`}
                    style={{width: `${((strength + 1) / 5) * 100}%`}}
                />
            </div>
            <p className={`text-xs mt-1 ${strength < PasswordStrength.Medium ? 'text-red-300' : 'text-gray-400'}`}>
                {t('Strength')}: {strengthLabel[strength]}
            </p>
        </div>
    );
}
