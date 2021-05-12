import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { TRANSLATIONS } from '../constants/translations';

export const browserLanguage = (typeof window !== 'undefined' && window.navigator ? (window.navigator.language ||
    window.navigator.systemLanguage ||
    window.navigator.userLanguage) : 'ru').substr(0, 2).toLowerCase();

i18n
    .use(initReactI18next)
    .init({
        resources: TRANSLATIONS,
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        },
        lng: 'ru',
        whitelist: ['ru', 'en'],
    });

export default i18n;
