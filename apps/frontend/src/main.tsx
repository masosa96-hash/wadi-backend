import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './index.css';

function App() {
  console.log("[App] Mounting...");

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

const el = document.getElementById('root')!;
createRoot(el).render(<App />);
