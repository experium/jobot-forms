import { path, split, replace, contains, head, prop, isEmpty, values, join, keys, startsWith } from 'ramda';
import * as yup from 'yup';

import i18n from './i18n';

import { EMAIL_EXPERIUM } from '../constants/regexps';
import { TYPES, VALIDATION_FILE_TYPES } from '../constants/allowFileExtensions';

export const checkFileType = (fileType, mimeType, allowFileExtensions = {}) => {
    switch (fileType) {
        case 'audio':
            return startsWith('audio', mimeType);
        case 'video':
            return startsWith('video', mimeType);
        default:
            const allowFileTypes = allowFileExtensions && !isEmpty(allowFileExtensions[fileType]) ? join(',', values(allowFileExtensions[fileType])) : TYPES[fileType];

            return contains(mimeType, split(',', replace(/\s/g, '', allowFileTypes)));
    }
};

export const compositeValidator = (value) => {
    return value && (value.length > 0) ? undefined : i18n.t('errors.composite');
};

export const validateLink = (field, values) => {
    const linkField = path(['settings', 'linkField'], field);
    const linkValue = path(['settings', 'linkValue'], field);

    if (!linkField) {
        return false;
    } else {
        const linkedValue = path(split('.', `${linkField}`), values);

        return linkValue === linkedValue;
    }
};

export const validate = (value, form, field, props, fieldsWithoutValidation) => {
    const htmlOpd = path(['htmlOpd'], props);
    const allowFileExtensions = props.allowFileExtensions;

    const rules = {
        email: yup.string().email(i18n.t('errors.email')).test({
            name: 'emailChars',
            message: i18n.t('errors.emailChars'),
            test: (value) => {
                if (!value) {
                    return true;
                }

                if (EMAIL_EXPERIUM.test(value)) {
                    return i18n.t('errors.emailChars');
                }
            },
        }),
        personalDataAgreement: htmlOpd ? yup.string() : yup.boolean(),
        boolean: yup.boolean(),
        choice: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        file: yup.mixed().test({
            name: 'fileExtensions',
            message: ({ value }) => {
                const type = Array.isArray(value) ? prop('type', head(value)) : prop('type', value);
                switch (type) {
                    case 'audio':
                        return i18n.t('errors.fileTypeAudio');
                    case 'video':
                        return i18n.t('errors.fileTypeVideo');
                    default:
                        if (allowFileExtensions && !isEmpty(allowFileExtensions[type])) {
                            return i18n.t('errors.fileType', { types: join(', ', keys(allowFileExtensions[type])) });
                        } else {
                            return i18n.t('errors.fileType', { types: prop(type, VALIDATION_FILE_TYPES) });
                        }
                }
            },
            test: (value) => {
                if (!value) {
                    return true;
                }

                if (path(['settings', 'multiple'], field)) {
                    let result = true;

                    value.forEach(value => {
                        if (result) {
                            result = checkFileType(value.type, value.contentType, allowFileExtensions);
                        }
                    });

                    return result;
                } else {
                    const { type, contentType } = value;

                    return checkFileType(type, contentType, allowFileExtensions);
                }
            },
        }),
        money: yup.object().shape({
            amount: field.required ? (
                yup.number().moreThan(0, ({ more }) => i18n.t('errors.moreThan', { more })).required(() => i18n.t('errors.required'))
            ) : yup.number().moreThan(0, ({ more }) => i18n.t('errors.moreThan', { more })),
            currency: yup.string().when('amount', (amount, schema) => {
                return amount ? schema.required(i18n.t('errors.currency')) : schema.nullable();
            }),
        })
    };

    let rule = rules[field.type] || yup.string();
    rule = (field.type === 'personalDataAgreement') ? rule.nullable().required(() => i18n.t('errors.required')) : (
        (field.required || validateLink(field, form)) && !fieldsWithoutValidation[field.field] ? rule.nullable().required(() => i18n.t('errors.required')) : rule.nullable()
    );

    try {
        rule.validateSync(value);
        return undefined;
    } catch (e) {
        return e.message;
    }
};
