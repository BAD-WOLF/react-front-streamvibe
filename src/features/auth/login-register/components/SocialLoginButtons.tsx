// Buttons for social login (Google, GitHub, etc.)

import type {Icon} from "@shared/types/Icon.ts";
import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {FaGithub, FaGoogle} from "react-icons/fa";
import type {Translation} from '@i18n/translation.ts';

// NOTA (nov/2026): a API ainda não tem login social. Os botões ficam, mas
// desabilitados e avisando, em vez de não fazer nada ao clicar.
export default function SocialLoginButtons(): ReactElement {
    const {t}: Translation = useTranslation();
    const providers: Array<Icon> = [
        {name: "Google", icon: <FaGoogle/>, color: "bg-red-600"},
        {name: "GitHub", icon: <FaGithub/>, color: "bg-gray-800"},
    ];

    return (
        <div className="flex flex-col gap-3">
            {providers.map(({name, icon, color}: Icon): ReactElement => (
                <button
                    key={name}
                    type="button"
                    disabled
                    title={t("Coming soon")}
                    className={`flex items-center justify-center gap-3 px-4 py-2 rounded-md ${color} text-white shadow-md opacity-50 cursor-not-allowed`}
                >
                    {icon}
                    {t("Continue with")} {name} · {t("Coming soon")}
                </button>
            ))}
        </div>
    );
}
