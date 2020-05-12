/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';
import i18n from './i18n';

yup.setLocale({
    mixed: {
        required: () => i18n.t('errors.required'),
    },
    number: {
        moreThan: ({ more }) => i18n.t('errors.moreThan', { more }),
    },
});
