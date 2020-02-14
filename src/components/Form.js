import React, { Component, Fragment } from 'react';
import { Form as FinalFormForm, Field } from 'react-final-form';
import { path, pathOr, contains } from 'ramda';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import * as yup from 'yup';

import Input from './formComponents/Input';
import Checkbox, { PersonalDataAgreement } from './formComponents/Checkbox';
import Select from './formComponents/Select';
import { PhoneInput } from './formComponents/MaskedInput';
import DateSelect from './formComponents/DateSelect';
import File from './formComponents/File';
import styles from '../styles/form.sass';

const FIELDS = {
    text: Input,
    email: Input,
    personalDataAgreement: PersonalDataAgreement,
    dictionary: Select,
    phone: PhoneInput,
    boolean: Checkbox,
    choice: Select,
    country: Select,
    city: Select,
    date: DateSelect,
    file: File
};

const validate = (field, value) => {
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

export default class Form extends Component {
    static defaultProps = {
        fields: [],
        dictionaryOptions: {}
    };

    state = {
        dictionaries: {}
    };

    dictionaryTypes = [];

    getDictionary = async (type) => {
        if (!contains(type, this.dictionaryTypes)) {
            this.dictionaryTypes.push(type);

            const { dictionaryUrl, dictionaryOptions } = this.props;
            const response = await fetch(`${dictionaryUrl || ''}/${type}`, {
                ...dictionaryOptions,
                method: 'GET'
            });
            const data = await response.json();

            this.setState(prev => ({
                dictionaries: {
                    ...prev.dictionaries,
                    [type]: data.map(({ name, id }) => ({ label: name, value: id }))
                }
            }));
        }
    }

    renderField = (field, name) => {
        const { opd, getFileUrl, postFileUrl } = this.props;

        return <Field
            name={name || field.field}
            component={FIELDS[field.type] || (() => null)}
            fieldType={field.type}
            options={
                this.state.dictionaries[path(['settings', 'dictionary'], field)] ||
                pathOr([], ['settings', 'choices'], field).map(({ value, id }) => ({ label: value, value: id }))
            }
            opd={opd}
            validate={value => validate(field, value)}
            getDictionary={this.getDictionary}
            getFileUrl={getFileUrl}
            postFileUrl={postFileUrl}
            {...field} />;
    }

    render() {
        const { onSubmit, fields } = this.props;

        return <div className={styles.formWrapper}>
            <FinalFormForm
                onSubmit={onSubmit}
                mutators={{ ...arrayMutators }}
                noValidate>
                { ({ handleSubmit }) =>
                    <form onSubmit={handleSubmit}>
                        { fields.map(field =>
                            <div key={field.field}>
                                { field.type === 'composite' ?
                                    <Fragment>
                                        <h2>{ field.label }</h2>
                                        { path(['settings', 'multiple'], field) ?
                                            <FieldArray name={field.field}>
                                                { fieldProps =>
                                                    <div>
                                                        { fieldProps.fields.map((name, index) =>
                                                            <div key={name}>
                                                                { pathOr([], ['settings', 'questions'], field).map(question =>
                                                                    <div key={`${name}-${question.field}`}>
                                                                        { this.renderField(question, `${name}.${question.field}`) }
                                                                    </div>
                                                                )}
                                                                <button className={styles.formSectionBtn} type='button' onClick={() => fieldProps.fields.remove(index)}>Удалить</button>
                                                            </div>
                                                        )}
                                                        <button className={styles.formSectionBtn} type='button' onClick={() => fieldProps.fields.push({})}>Добавить</button>
                                                    </div>

                                                }
                                            </FieldArray> :
                                            pathOr([], ['settings', 'questions'], field).map(question =>
                                                <div key={`${field.field}-${question.field}`}>
                                                    { this.renderField(question, `${field.field}.${question.field}`) }
                                                </div>
                                            )
                                        }
                                    </Fragment> :
                                    this.renderField(field)
                                }
                            </div>
                        )}
                        <div>
                            <button className={styles.formBtn} type='submit'>Отправить</button>
                        </div>
                    </form>
                }
            </FinalFormForm>
        </div>;
    }
}
