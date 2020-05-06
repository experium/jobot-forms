/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

yup.setLocale({
    mixed: {
        required: 'Поле обязательно для заполнения',
    },
    number: {
        moreThan: 'Число должно быть больше ${more}',
    },
});
