import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import './index.css';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
}

const el = document.getElementById('root')!;
createRoot(el).render(<App />);
