import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { api } from './config/api';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import './utils/debug'; // Load debug utilities in dev mode

export default function App() {
    // Initialize translation hook to ensure i18n is ready
    useTranslation();

    const [healthError, setHealthError] = useState<string | null>(null);

    useEffect(() => {
        // Check API health on boot
        const checkHealth = async () => {
            try {
                const response = await api.get<{ status: string, supabase: string }>('/api/health');
                if (response.status !== 'ok') {
                    setHealthError('API no disponible');
                }
            } catch (error) {
                console.error('Health check failed:', error);
                setHealthError('No se pudo conectar con el servidor');
            }
        };

        checkHealth();
    }, []);

    if (healthError) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <h2 style={{ margin: 0 }}>Error de Conexión</h2>
                <p style={{ margin: 0, color: '#666' }}>{healthError}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        background: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
            <SpeedInsights />
            <Analytics />
        </ErrorBoundary>
    );
}
