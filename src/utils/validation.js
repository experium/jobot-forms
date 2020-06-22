import { propOr, path } from 'ramda';
import * as yup from 'yup';

import i18n from './i18n';

export const compositeValidator = field => (value, allValues) => {
    if (field.required) {
        const blockValue = propOr([], field.field, allValues);

        return blockValue.length > 0 ? undefined : 'Блок обязателен для заполнения';
    } else {
        return undefined;
    }
};

export const validate = (field, value, props, fieldsWithoutValidation) => {
    const htmlOpd = path(['htmlOpd'], props);

    const rules = {
        email: yup.string().email(i18n.t('errors.email')),
        personalDataAgreement: htmlOpd ? yup.string() : yup.boolean(),
        boolean: yup.boolean(),
        choice: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        file: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        money: yup.object().shape({
            amount: field.required ? (
                yup.number().moreThan(0).required()
            ) : yup.number().moreThan(0),
            currency: yup.string().when('amount', (amount, schema) => {
                return amount ? schema.required(i18n.t('errors.currency')) : schema.nullable();
            }),
        })
    };
    let rule = rules[field.type] || yup.string();
    rule = (field.type === 'personalDataAgreement') ? rule.nullable().required() : (
        field.required && !fieldsWithoutValidation[field.field] ? rule.nullable().required() : rule.nullable()
    );

    try {
        rule.validateSync(value);
        return undefined;
    } catch (e) {
        return e.message;
    }
};
