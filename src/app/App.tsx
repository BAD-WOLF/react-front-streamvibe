import "@shared/styles/globals.scss";
import "@shared/styles/tailwind.css";
import {i18nReady} from '@i18n/i18n.ts';
import {SessionProvider} from '@shared/auth/SessionProvider.tsx';
import {type Dispatch, type ReactElement, type SetStateAction, StrictMode, useEffect, useState} from "react";
import AppRoutes from "./AppRoutes.tsx";

export default function App(): ReactElement | null {
    const [ready, setReady]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    useEffect((): void => {
        // sem os catálogos, a tela mostra as chaves (em inglês): melhor que não abrir
        void i18nReady.finally((): void => setReady(true));
    }, []);

    if (!ready) return null;

    return (
        <div className='min-h-lvh w-full'>
            <StrictMode>
                <SessionProvider>
                    <AppRoutes/>
                </SessionProvider>
            </StrictMode>
        </div>
    );
}
