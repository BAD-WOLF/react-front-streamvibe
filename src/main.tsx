import {createRoot, type Root} from 'react-dom/client';
import App from './app/App.tsx';

const container: HTMLElement | null = document.getElementById('root');
if (container === null) throw new Error('The #root element is missing from index.html');

const root: Root = createRoot(container);
root.render(
    <App/>
);
