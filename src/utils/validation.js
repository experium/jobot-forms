import { propOr, path } from 'ramda';
import * as yup from 'yup';

export const compositeValidator = field => (value, allValues) => {
    if (field.required) {
        const blockValue = propOr([], field.field, allValues);

        return blockValue.length > 0 ? undefined : 'Блок обязателен для заполнения';
    } else {
        return undefined;
    }
};

export const validate = (field, value) => {
    const rules = {
        email: yup.string().email('Неверный email'),
        personalDataAgreement: yup.boolean(),
        boolean: yup.boolean(),
        choice: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
        file: path(['settings', 'multiple'], field) ? yup.array() : yup.string(),
    };
    let rule = rules[field.type] || yup.string();
    rule = field.required ? rule.nullable().required('Поле обязательно для заполнения') : rule.nullable();

    try {
        rule.validateSync(value);
        return undefined;
    } catch (e) {
        return e.message;
    }
};
