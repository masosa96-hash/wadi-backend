import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import authEs from './locales/es/auth.json';
import authEsMX from './locales/es-MX/auth.json';
import authEn from './locales/en/auth.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            es: {
                auth: authEs,
            },
            'es-MX': {
                auth: authEsMX,
            },
            en: {
                auth: authEn,
            },
        },
        lng: 'es-MX', // Default language
        fallbackLng: 'es',
        defaultNS: 'auth',
        interpolation: {
            escapeValue: false, // React already safes from xss
        },
    });

export default i18n;
