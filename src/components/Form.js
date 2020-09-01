/* eslint-disable no-mixed-operators */
import '../utils/i18n';
import i18n from '../utils/i18n';
/* eslint-disable no-template-curly-in-string */

import React, { Component, Fragment } from 'react';
import { Form as FinalFormForm, Field, FormSpy } from 'react-final-form';
import { path, pathOr, contains, prop, propOr, is, mapObjIndexed, equals, isEmpty } from 'ramda';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { withTranslation } from 'react-i18next';

import '../styles/index.css';
import styles from '../styles/index.module.css';

import Input from './formComponents/Input';
import Checkbox, { PersonalDataAgreement, Boolean } from './formComponents/Checkbox';
import Select, { LocationSelect } from './formComponents/Select';
import DictionarySelect from './formComponents/DictionarySelect';
import TreeSelect from './formComponents/TreeSelect';
import { PhoneInput } from './formComponents/MaskedInput';
import DateSelect from './formComponents/DateSelect';
import File from './formComponents/File';
import Radio from './formComponents/Radio';
import Money from './formComponents/Money';
import DICTIONARIES_NAMES, { GEO_DICTIONARIES } from '../constants/dictionaries';
import { compositeValidator, validate } from '../utils/validation';
import { RU } from '../constants/translations';
import withFieldWrapper from './hocs/withFieldWrapper';
import LinkedFieldWrapper from './hocs/LinkedFieldWrapper';
import { isLinkedQuestion, findChildGeoQuestionsNames } from '../utils/questions';
import { isLinkedField } from '../utils/field';
import { fieldArrayInitialValues } from '../constants/form';
import { CompanyDictionaryContext } from '../context/CompanyDictionary';
import Spinner from './formComponents/Spinner';

const CompositeError = ({ meta }) => {
    return (is(String, meta.error) && meta.error && meta.submitFailed) ? (
        <div className={styles.compositeError}>{ meta.error }</div>
    ) : null;
};

const getFieldComponent = (field, components) => {
    const { type, settings = {} } = field;

    const DEFAULT_FIELDS = {
        text: Input,
        email: Input,
        personalDataAgreement: PersonalDataAgreement,
        dictionary: prop('checkboxes', settings) ? (
            prop('multiple', settings) ? Checkbox : Radio
        ) : Select,
        phone: PhoneInput,
        boolean: Boolean,
        choice: Select,
        country: LocationSelect,
        region: LocationSelect,
        city: LocationSelect,
        date: DateSelect,
        file: File,
        money: Money,
        company_dictionary: prop('tree', settings) ? TreeSelect : DictionarySelect,
    };
    const fields = mapObjIndexed((component, key) => components[key] ? withFieldWrapper(components[key]) : component, DEFAULT_FIELDS);

    return fields[type];
};

const defaultFormRender = ({ fields, renderField }) => fields.map(renderField);

class Form extends Component {
    static defaultProps = {
        fields: [],
        dictionaryOptions: {},
        components: {},
        language: RU,
    };

    constructor(props) {
        super(props);

        const language = props.language || RU;

        this.state = {
            language,
            dictionaries: {},
            errors: {},
            initialValues: props.initialValues || {},
            fieldsWithoutValidation: {},
            options: {}
        };

        this.dictionaryTypes = [];
        this.formProps = null;

        i18n.changeLanguage(language);

        if (props.translations) {
            i18n.addResources('ru', 'translation', pathOr({}, ['ru', 'translation'], props.translations));
            i18n.addResources('en', 'translation', pathOr({}, ['en', 'translation'], props.translations));
        }
    }

    changeOptions = (field, options) => {
        this.setState(state => ({
            ...state,
            options: {
                ...state.options,
                [field]: options,
            }
        }));
    }

    changeFieldValidation = (fieldName, validate) => {
        this.setState(state => ({
            fieldsWithoutValidation: {
                ...state.fieldsWithoutValidation,
                [fieldName]: validate
            },
        }));
    }

    componentDidUpdate = (prevProps) => {
        const { language } = prevProps;
        const { language: languageProps, initialValues, serverErrors } = this.props;

        if (languageProps !== language) {
            this.setState({ language: languageProps }, () => i18n.changeLanguage(this.state.language));
        }

        if (!equals(initialValues, prevProps.initialValues)) {
            this.setState({ initialValues });
        }

        if (!prevProps.serverErrors && serverErrors) {
            this.scrollToInvalidField();
        }
    }

    getDictionary = async (type, dataPath, urlParams, optionsPaths = {}) => {
        if (!contains(type, this.dictionaryTypes)) {
            const { apiUrl, dictionaryOptions } = this.props;

            try {
                const response = await fetch(`${apiUrl || ''}/api/${GEO_DICTIONARIES[type] ? type : `dictionary/${type || ''}`}${urlParams || ''}`, {
                    ...dictionaryOptions,
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error();
                }

                const responseData = dataPath ? prop(dataPath, await response.json()) : await response.json();
                const data = Array.isArray(responseData) ? responseData : [responseData];
                this.dictionaryTypes.push(type);

                this.setState(prev => ({
                    dictionaries: {
                        ...prev.dictionaries,
                        [type]: data.map((item) => ({
                            label: propOr(propOr('', 'name', item), optionsPaths.labelPath, item),
                            value: propOr(item.id, optionsPaths.valuePath, item),
                            country: item.country,
                            region: item.region,
                            translations: item.translations,
                        }))
                    },
                    errors: {
                        ...prev.errors,
                        [type]: false,
                    },
                }));
            } catch {
                this.setState(prev => ({
                    dictionaries: {
                        ...prev.dictionaries,
                    },
                    errors: {
                        ...prev.errors,
                        [type]: true,
                    },
                }));
            }
        }
    }

    getDictionaryType = (field) => {
        const { settings, type } = field;
        const dictionary = path(['dictionary'], settings);

        if (dictionary) {
            return dictionary;
        } else {
            return DICTIONARIES_NAMES[type] || GEO_DICTIONARIES[type];
        }
    }

    getOptions = (field) => {
        const { language } = this.props;
        const options = this.state.dictionaries[path(['settings', 'dictionary'], field)] ||
        this.state.dictionaries[DICTIONARIES_NAMES[field.type]] ||
        this.state.dictionaries[GEO_DICTIONARIES[field.type]] ||
        pathOr([], ['settings', 'choices'], field).map(({ value, id }) => ({ label: value, value: id }));

        if (isEmpty(options)) {
            return undefined;
        }

        if (language === RU) {
            return options;
        } else {
            return options.map(option => ({
                ...option,
                label: path(['translations', 'value'], option) ? pathOr(option.label, ['translations', 'value', language], option) : (
                    pathOr(option.label, ['translations', language], option)
                ),
            }));
        }
    }

    onChangeQuestion = (field) => (value, form) => {
        const { batch, change, getState } = form;

        const { fields } = this.props;
        const { fieldType, field: name } = field;
        const isLinked  = isLinkedQuestion(field);
        const formValues = prop('values', getState());

        if (isLinked && formValues[name] !== value) {
            const geoQuestions = findChildGeoQuestionsNames(fields, fieldType, formValues);

            !isEmpty(geoQuestions) && (
                batch(() => {
                    return geoQuestions.forEach(fieldName => {
                        change(fieldName, undefined);
                    });
                })
            );
        }
    };

    renderField = (field, name, form) => {
        const { opd, getFileUrl, postFileUrl, apiUrl, language, components, htmlOpd, getOpdValues, serverErrors, fields, allowFileExtensions } = this.props;
        const { fieldsWithoutValidation, errors } = this.state;
        const fieldName = name || field.field;
        const isLinked = isLinkedField(field);

        const renderLinkedField = (props = {}) => (
            <Field
                name={fieldName}
                component={getFieldComponent(field, components) || (() => null)}
                fieldType={field.type}
                options={this.getOptions(field)}
                opd={opd}
                validate={(value, form) => validate(value, form, field, this.props, fieldsWithoutValidation)}
                getDictionary={this.getDictionary}
                dictionaryType={this.getDictionaryType(field)}
                getFileUrl={getFileUrl}
                postFileUrl={postFileUrl}
                apiUrl={apiUrl}
                {...field}
                label={language ? pathOr(field.label, ['translations', 'label', language], field) : field.label}
                extra={path(['extra'], field)}
                errors={errors}
                htmlOpd={htmlOpd}
                getOpdValues={getOpdValues}
                form={form}
                onChange={this.onChangeQuestion(field)}
                initialRequired={field.required}
                fieldsWithoutValidation={fieldsWithoutValidation}
                changeFieldValidation={this.changeFieldValidation}
                serverErrors={serverErrors}
                fields={fields}
                allowFileExtensions={allowFileExtensions}
                {...props}
            />
        );

        return isLinked ? (
            <LinkedFieldWrapper field={field}>
                { renderLinkedField }
            </LinkedFieldWrapper>
        ) : (
            <Field
                name={fieldName}
                component={getFieldComponent(field, components) || (() => null)}
                fieldType={field.type}
                options={this.getOptions(field)}
                opd={opd}
                validate={(value, form) => validate(value, form, field, this.props, fieldsWithoutValidation)}
                getDictionary={this.getDictionary}
                dictionaryType={this.getDictionaryType(field)}
                getFileUrl={getFileUrl}
                postFileUrl={postFileUrl}
                apiUrl={apiUrl}
                {...field}
                label={language ? pathOr(field.label, ['translations', 'label', language], field) : field.label}
                extra={path(['extra'], field)}
                errors={errors}
                htmlOpd={htmlOpd}
                getOpdValues={getOpdValues}
                form={form}
                onChange={this.onChangeQuestion(field)}
                initialRequired={field.required}
                fieldsWithoutValidation={fieldsWithoutValidation}
                changeFieldValidation={this.changeFieldValidation}
                serverErrors={serverErrors}
                fields={fields}
                allowFileExtensions={allowFileExtensions}
            />
        );
    }

    onSubmit = values => this.props.onSubmit(values, this.formProps);

    renderCompositeRemoveButton = (field, index) => {
        if (field.required) {
            return index !== 0;
        } else {
            return true;
        }
    }

    onChangeSubmitFailed = ({ submitFailed }) => {
        if (submitFailed && this.props.onSubmitFail) {
            this.props.onSubmitFail();
        }
    }

    scrollToInvalidField = () => {
        const { scrollContainerClassName, scrollContainer } = this.props;
        const invalidField = this.container.querySelector('.jobot-form-invalid');
        const scrollContainerElement = scrollContainer || scrollContainerClassName ? document.querySelector(scrollContainerClassName) : null;

        if (invalidField) {
            const input = invalidField.querySelector('input');

            if (scrollContainerElement) {
                scrollContainerElement.scrollTo({
                    top: invalidField.getBoundingClientRect().top + scrollContainerElement.scrollTop - 15,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo({
                    top: invalidField.getBoundingClientRect().top + window.scrollY - 15,
                    behavior: 'smooth'
                });
            }

            if (input) {
                setTimeout(() => input.focus(), 1000);
            }
        }
    }

    handleSubmit = (e, handleSubmit) => {
        this.scrollToInvalidField();
        handleSubmit(e);
    }

    render() {
        const { fields, language, formRender, t, submitting: externalSubmitting } = this.props;
        const contextValue = {
            options: this.state.options,
            changeOptions: this.changeOptions,
        };

        const FormRender = formRender || defaultFormRender;

        return <div className={styles.formWrapper} ref={node => this.container = node}>
            <CompanyDictionaryContext.Provider value={contextValue}>
                <FinalFormForm
                    onSubmit={this.onSubmit}
                    mutators={{ ...arrayMutators }}
                    keepDirtyOnReinitialize={false}
                    subscription={{ values: false, submitFailed: true, submitting: true }}
                    initialValues={this.state.initialValues}
                    noValidate
                >
                    { (formProps) => {
                        const { handleSubmit, form, submitting, submitFailed } = formProps;

                        if (!this.formProps) {
                            this.formProps = form;
                        }

                        return <form onSubmit={e => this.handleSubmit(e, handleSubmit)} noValidate className={submitFailed ? 'jobot-form-submit-failed' : ''}>
                            <FormSpy
                                subscription={{ submitFailed: true }}
                                onChange={this.onChangeSubmitFailed} />
                            <FormRender
                                {...formProps}
                                fields={fields}
                                renderField={field =>
                                    <div key={field.field}>
                                        { field.type === 'composite' ?
                                            <Fragment>
                                                <h2>{ language ? pathOr(field.label, ['translations', 'label', language], field) : field.label }</h2>
                                                { path(['settings', 'multiple'], field) ?
                                                    <FieldArray
                                                        name={field.field}
                                                        validate={field.required ? compositeValidator : undefined}
                                                        initialValue={fieldArrayInitialValues}
                                                    >
                                                        { (fieldProps) =>
                                                            <div className={styles.formSection}>
                                                                <CompositeError meta={prop('meta', fieldProps)} />
                                                                { fieldProps.fields.map((name, index) =>
                                                                    <div key={name} className={styles.formSectionRow}>
                                                                        { pathOr([], ['settings', 'questions'], field).map(question =>
                                                                            <div key={`${name}-${question.field}`}>
                                                                                { this.renderField(question, `${name}.${question.field}`, form) }
                                                                            </div>
                                                                        )}
                                                                        { this.renderCompositeRemoveButton(field, index) && (
                                                                            <button
                                                                                className={styles.formSectionBtn}
                                                                                type='button'
                                                                                onClick={() => fieldProps.fields.remove(index)}
                                                                            >
                                                                                { t('remove') }
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <button className={styles.formSectionBtn} type='button' onClick={() => fieldProps.fields.push({})}>{t('addQuestionBlock')}</button>
                                                            </div>
                                                        }
                                                    </FieldArray> :
                                                    pathOr([], ['settings', 'questions'], field).map(question =>
                                                        <div key={`${field.field}-${question.field}`}>
                                                            { this.renderField(question, `${field.field}.${question.field}`, form) }
                                                        </div>
                                                    )
                                                }
                                            </Fragment> :
                                            this.renderField(field, null, form)
                                        }
                                    </div>
                                }
                            />
                            <div>
                                <button className={styles.formBtn} type='submit' disabled={submitting || !!externalSubmitting}>
                                    { (submitting || !!externalSubmitting) && <Spinner />}
                                    <span className='button-text'>
                                        { t('send') }
                                    </span>
                                </button>
                            </div>
                        </form>;
                    }}
                </FinalFormForm>
            </CompanyDictionaryContext.Provider>
        </div>;
    }
}

export default withTranslation()(Form);
