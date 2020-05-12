import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { TRANSLATIONS } from '../constants/translations';

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
        whitelist: ['ru', 'en'],
    });

export default i18n;
