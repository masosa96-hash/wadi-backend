import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { useTranslation } from 'react-i18next';

export default function App() {
    // Initialize translation hook to ensure i18n is ready
    useTranslation();

    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
}
