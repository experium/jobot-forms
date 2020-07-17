import { path } from 'ramda';
import * as yup from 'yup';

import i18n from './i18n';

export const compositeValidator = (value) => {
    return value && (value.length > 0) ? undefined : 'Блок обязателен для заполнения';
};

export const validate = async (field, value, props, fieldsWithoutValidation) => {
    const htmlOpd = path(['htmlOpd'], props);

    const rules = {
        email: yup.string().email(i18n.t('errors.email')),
        personalDataAgreement: htmlOpd ? yup.string() : yup.boolean(),
        boolean: yup.boolean(),
        choice: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        file: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
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
        field.required && !fieldsWithoutValidation[field.field] ? rule.nullable().required(() => i18n.t('errors.required')) : rule.nullable()
    );

    try {
        rule.validateSync(value);
        return undefined;
    } catch (e) {
        return e.message;
    }
};
