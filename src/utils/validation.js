import { path, split, replace, contains, head, prop } from 'ramda';
import * as yup from 'yup';

import i18n from './i18n';

import { TYPES, VALIDATION_FILE_TYPES } from '../constants/allowFileExtensions';

export const checkFileType = (fileType, mimeType) => {
    const allowFileTypes = TYPES[fileType];

    return contains(mimeType, split(',', replace(/\s/g, '', allowFileTypes)));
};

export const compositeValidator = (value) => {
    return value && (value.length > 0) ? undefined : 'Блок обязателен для заполнения';
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
        email: yup.string().email(i18n.t('errors.email')),
        personalDataAgreement: htmlOpd ? yup.string() : yup.boolean(),
        boolean: yup.boolean(),
        choice: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        file: allowFileExtensions ? path(['settings', 'multiple'], field) ? yup.array() : yup.string() : (
            yup.mixed().test({
                name: 'fileExtensions',
                message: ({ value }) => {
                    const types = Array.isArray(value) ? (
                        prop(prop('type', head(value)), VALIDATION_FILE_TYPES)
                    ) : prop('type', VALIDATION_FILE_TYPES);

                    return i18n.t('errors.fileType', { types });
                },
                test: (value) => {
                    if (!value) {
                        return true;
                    }

                    if (Array.isArray(value)) {
                        let result = true;

                        value.forEach(value => {
                            if (result) {
                                result = checkFileType(value.type, value.contentType);
                            }
                        });

                        return result;
                    } else {
                        const { type, contentType } = value;

                        return checkFileType(type, contentType);
                    }
                },
            })
        ),
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
