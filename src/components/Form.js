import React, { Component, Fragment } from 'react';
import { Form as FinalFormForm, Field } from 'react-final-form';
import { path, pathOr, contains, prop, propOr, is } from 'ramda';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';

import Input from './formComponents/Input';
import Checkbox, { PersonalDataAgreement, Boolean } from './formComponents/Checkbox';
import Select from './formComponents/Select';
import DictionarySelect from './formComponents/DictionarySelect';
import { PhoneInput } from './formComponents/MaskedInput';
import DateSelect from './formComponents/DateSelect';
import File from './formComponents/File';
import '../styles/index.css';
import styles from '../styles/index.module.css';
import Radio from './formComponents/Radio';
import Money from './formComponents/Money';
import DICTIONARIES_NAMES, { GEO_DICTIONARIES } from '../constants/dictionaries';
import { compositeValidator, validate } from '../utils/validation';

const CompositeError = ({ meta }) => {
    return (is(String, meta.error) && meta.error && meta.submitFailed) ? (
        <div className={styles.compositeError}>{ meta.error }</div>
    ) : null;
};

const getFieldComponent = (field) => {
    const { type, settings = {} } = field;

    const FIELDS = {
        text: Input,
        email: Input,
        personalDataAgreement: PersonalDataAgreement,
        dictionary: prop('checkboxes', settings) ? (
            prop('multiple', settings) ? Checkbox : Radio
        ) : Select,
        phone: PhoneInput,
        boolean: Boolean,
        choice: Select,
        country: Select,
        region: Select,
        city: Select,
        date: DateSelect,
        file: File,
        money: Money,
        company_dictionary: DictionarySelect,
    };

    return FIELDS[type];
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
    formProps = null;

    getDictionary = async (type, dataPath, urlParams, optionsPaths = {}) => {
        if (!contains(type, this.dictionaryTypes)) {
            this.dictionaryTypes.push(type);
            const { apiUrl, dictionaryOptions } = this.props;

            const response = await fetch(`${apiUrl || ''}/api/${GEO_DICTIONARIES[type] ? type : `dictionary/${type || ''}`}${urlParams || ''}`, {
                ...dictionaryOptions,
                method: 'GET',
            });

            const responseData = dataPath ? prop(dataPath, await response.json()) : await response.json();
            const data = Array.isArray(responseData) ? responseData : [responseData];

            this.setState(prev => ({
                dictionaries: {
                    ...prev.dictionaries,
                    [type]: data.map((item) => ({
                        label: propOr(item.name, optionsPaths.labelPath, item),
                        value: propOr(item.id, optionsPaths.valuePath, item),
                        country: item.country,
                        region: item.region
                    }))
                }
            }));
        }
    }

    renderField = (field, name) => {
        const { opd, getFileUrl, postFileUrl, apiUrl, language } = this.props;

        return <Field
            name={name || field.field}
            component={getFieldComponent(field) || (() => null)}
            fieldType={field.type}
            options={
                this.state.dictionaries[path(['settings', 'dictionary'], field)] ||
                this.state.dictionaries[DICTIONARIES_NAMES[field.type]] ||
                this.state.dictionaries[GEO_DICTIONARIES[field.type]] ||
                pathOr([], ['settings', 'choices'], field).map(({ value, id }) => ({ label: value, value: id }))
            }
            opd={opd}
            validate={value => validate(field, value)}
            getDictionary={this.getDictionary}
            getFileUrl={getFileUrl}
            postFileUrl={postFileUrl}
            apiUrl={apiUrl}
            {...field}
            label={language ? pathOr(field.label, ['translations', 'label', language], field) : field.label}
        />;
    }

    onSubmit = values => this.props.onSubmit(values, this.formProps);

    render() {
        const { fields, language } = this.props;

        return <div className={styles.formWrapper}>
            <FinalFormForm
                onSubmit={this.onSubmit}
                mutators={{ ...arrayMutators }}
                keepDirtyOnReinitialize={true}
                subscription={{ values: false, submitFailed: true }}
                noValidate>
                { ({ handleSubmit, form }) => {
                    if (!this.formProps) {
                        this.formProps = form;
                    }

                    return <form onSubmit={handleSubmit}>
                        { fields.map((field) =>
                            <div key={field.field}>
                                { field.type === 'composite' ?
                                    <Fragment>
                                        <h2>{ language ? pathOr(field.label, ['translations', 'label', language], field) : field.label }</h2>
                                        { path(['settings', 'multiple'], field) ?
                                            <FieldArray
                                                name={field.field}
                                                validate={compositeValidator(field)}
                                                initialValue={[{ }]}
                                            >
                                                { (fieldProps) =>
                                                    <div>
                                                        <CompositeError meta={prop('meta', fieldProps)} />
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
                    </form>;
                }}
            </FinalFormForm>
        </div>;
    }
}
