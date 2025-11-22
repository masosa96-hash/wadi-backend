import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './store/LanguageContext';
import './index.css';


function App() {
  console.log("[App] Mounting...");

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

const el = document.getElementById('root')!;
createRoot(el).render(<App />);
