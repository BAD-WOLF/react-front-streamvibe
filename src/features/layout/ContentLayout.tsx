import {Footer} from '@layout/Footer.tsx';
import {Header} from '@layout/Header.tsx';
import {homeClasses, homeStyles} from '@shared/styles/ts/home/HomeStyles.ts';
import type {ReactElement} from 'react';
import {Outlet} from 'react-router-dom';

/** Header + página + Footer, para todas as páginas de conteúdo (as que pedem login). */
export function ContentLayout(): ReactElement {
    return (
        <div className={homeClasses.container} style={{background: homeStyles.background}}>
            <Header/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );
}
