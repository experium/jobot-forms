import { path, split, replace, contains, head, prop, isEmpty, values, join, keys, startsWith, is } from 'ramda';
import * as yup from 'yup';
import { isPhoneNumber } from 'class-validator';
import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js';

import i18n from './i18n';

import { EMAIL_EXPERIUM, EMAIL_DOMAIN, EMAIL_RFC, EMAIL_RFC_LOCALPART } from '../constants/regexps';
import { defaultAllowFileExtensions, VALIDATION_FILE_TYPES } from '../constants/allowFileExtensions';

export const checkFileType = (fileType, mimeType, allowFileExtensions = {}) => {
    switch (fileType) {
        case 'audio':
            return startsWith('audio', mimeType);
        case 'video':
            return startsWith('video', mimeType);
        default:
            const allowFileTypes = join(',', values(
                allowFileExtensions && !isEmpty(allowFileExtensions[fileType]) ? allowFileExtensions[fileType] : defaultAllowFileExtensions[fileType]
            ));

            return allowFileTypes ? contains(mimeType, split(',', replace(/\s/g, '', allowFileTypes))) : true;
    }
};
export const getFileTypeMessage = (type, allowFileExtensions = {}) => {
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

const rules = {
    text: field => yup.string().nullable()
        .test({
            name: 'text',
            message: i18n.t('errors.required'),
            test: value => {
                const mask = path(['settings', 'mask'], field);
                const minLength = path(['settings', 'minLength'], field);

                if (!value || !mask || !is(String, mask)) {
                    return true;
                }
                const parsedValue = value.replace(/[\s]+/gm, '');
                const parsedMask = mask.replace(/[\s]+/gm, '');

                const maskFull = parsedMask.length === parsedValue.length;
                const maskMin = (parsedValue.length >= minLength) && (parsedValue.length <= parsedMask.length);

                return minLength ? maskMin : maskFull;
            }
        })
        .test({
            name: 'maxLength',
            message: i18n.t('errors.maxLength', { count: path(['settings', 'maxLength'], field) }),
            test: value => {
                const maxLength = path(['settings', 'maxLength'], field);

                if (!value || !maxLength) {
                    return true;
                }

                return value.length <= maxLength;
            }
        })
        .test({
            name: 'minLength',
            message: i18n.t('errors.minLength', { count: path(['settings', 'minLength'], field) }),
            test: value => {
                const minLength = path(['settings', 'minLength'], field);

                if (!value || !minLength) {
                    return true;
                }

                return value.length > minLength;
            }
        }),
    phone: field => yup.string().nullable().test({
        name: 'phone',
        message: ({ value }) => {
            const { required } = field;

            if (required && !value) {
                return i18n.t('errors.required');
            } else {
                return i18n.t('errors.phone');
            }
        },
        test: (value) => {
            if (!value) {
                return true;
            }

            try {
                if (path(['settings', 'international'], field)) {
                    const phoneNumber = parsePhoneNumberWithError(value);
                    return phoneNumber.isValid();
                } else {
                    return isPhoneNumber(value, 'RU') || isPhoneNumber(value, 'KZ');
                }
            } catch (error) {
                if (error instanceof ParseError) {
                    return false;
                }
            }
        },
    }),
    email: field => yup.string().nullable()
        .email(i18n.t('errors.email'))
        .matches(EMAIL_RFC, i18n.t('errors.email'))
        .matches(EMAIL_RFC_LOCALPART, i18n.t('errors.email'))
        .test({
            name: 'emailChars',
            message: ({ value }) => {
                const invalidChars = !EMAIL_EXPERIUM.test(value);
                const invalidDomain = !EMAIL_DOMAIN.test(value);

                if (invalidChars || invalidDomain) {
                    return invalidDomain ? i18n.t('errors.emailDomain') : i18n.t('errors.emailChars');
                }
            },
            test: (value) => {
                if (!value) {
                    return true;
                }

                return EMAIL_EXPERIUM.test(value);
            },
        })
        .test({
            name: 'maxLength',
            message: i18n.t('errors.maxLength', { count: path(['settings', 'maxLength'], field) }),
            test: value => {
                const maxLength = path(['settings', 'maxLength'], field);

                if (!value || !maxLength) {
                    return true;
                }

                return value.length <= maxLength;
            }
        }),
    personalDataAgreement: (field, { htmlOpd }) => htmlOpd ? yup.string() : yup.boolean(),
    boolean: field => yup.boolean(),
    choice: field => path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
    file: (field, { allowFileExtensions }) => yup.mixed().test({
        name: 'fileExtensions',
        message: ({ value }) => {
            const type = Array.isArray(value) ? prop('type', head(value)) : prop('type', value);
            return getFileTypeMessage(type, allowFileExtensions);
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
                return checkFileType(value.type, value.contentType, allowFileExtensions);
            }
        },
    }),
    money: field => yup.object().shape({
        amount: field.required ? (
            yup.number().nullable().required(() => i18n.t('errors.required')).moreThan(0, ({ more }) => i18n.t('errors.moreThan', { more }))
        ) : yup.number().nullable().moreThan(0, ({ more }) => i18n.t('errors.moreThan', { more })),
        currency: yup.string().nullable().when('amount', (amount, schema) => {
            return amount ? schema.required(() => i18n.t('errors.currency')) : schema;
        }),
    }),
    date: () => yup.string().nullable().test({
        name: 'completeDate',
        message: i18n.t('errors.icompleteDate'),
        test: value => value !== 'incomplete'
    })
};

export const validate = (value, form, field, fieldsWithoutValidation, props) => {
    const customValidation = path(['customValidation', field.field], props);

    try {
        let rule = rules[field.type] ? rules[field.type](field, props) : yup.string();
        rule = (field.type === 'personalDataAgreement') ? rule.nullable().required(() => i18n.t('errors.required')) : (
            (field.required || validateLink(field, form)) && !fieldsWithoutValidation[field.field] ? rule.nullable().required(() => i18n.t('errors.required')) : rule.nullable()
        );
        rule = customValidation ? customValidation(rule) : rule;

        rule.validateSync(value);
        return undefined;
    } catch (e) {
        return `${e.message}`;
    }
};
