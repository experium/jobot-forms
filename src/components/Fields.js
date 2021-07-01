import React, { Component, Fragment } from 'react';
import { Field } from 'react-final-form';
import { assocPath, path, pathOr, contains, prop, propOr, is, mapObjIndexed, isEmpty, filter, includes, forEach, trim } from 'ramda';
import { FieldArray } from 'react-final-form-arrays';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import styles from '../styles/index.module.css';

import Input from './formComponents/Input';
import Checkbox, { Boolean } from './formComponents/Checkbox';
import PersonalDataAgreement from './formComponents/PersonalDataAgreement';
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
import { translateOptionLabel } from '../utils/i18n';
import { fieldArrayInitialValues } from '../constants/form';
import { getHtml } from './formComponents/HtmlOpdForm';

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

class Fields extends Component {
    static defaultProps = {
        fields: [],
        dictionaryOptions: {},
        components: {},
        language: RU,
        disabled: false,
        excludeDictionary: {},
        renameDictionary: {}
    };

    constructor(props) {
        super(props);

        this.dictionaryTypes = [];
    }

    getDictionary = async (type, dataPath, urlParams, optionsPaths = {}) => {
        if (type && !contains(type, this.dictionaryTypes)) {
            const { apiUrl, dictionaryOptions } = this.props;

            try {
                urlParams = qs.parse(urlParams || {}, { ignoreQueryPrefix: true });
                urlParams = assocPath(['filter', 'company'], this.props.company, urlParams);
                const response = await fetch(
                    `${apiUrl || ''}/api/${GEO_DICTIONARIES[type] ? type : `dictionary/${type || ''}`}?${qs.stringify(urlParams) || ''}`,
                    {
                        ...dictionaryOptions,
                        method: 'GET',
                        headers: {
                            'accept-language': RU,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error();
                }

                const responseData = dataPath ? prop(dataPath, await response.json()) : await response.json();
                let data = Array.isArray(responseData) ? responseData : [responseData];

                if (this.props.excludeDictionary[type]) {
                    data = filter(item => !includes(item.id, this.props.excludeDictionary[type]), data);
                }

                if (this.props.renameDictionary[type]) {
                    data = data.map(item => this.props.renameDictionary[type][item.id] ? { ...item, name: this.props.renameDictionary[type][item.id] } : item);
                }

                this.dictionaryTypes.push(type);

                this.props.setFormState(prev => ({
                    dictionaries: {
                        ...prev.dictionaries,
                        [type]: data.map((item) => ({
                            label: propOr(propOr('', 'name', item), optionsPaths.labelPath, item),
                            value: propOr(item.id, optionsPaths.valuePath, item),
                            internalId: item.internalId,
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
                this.props.setFormState(prev => ({
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
        const options = this.props.dictionaries[path(['settings', 'dictionary'], field)] ||
            this.props.dictionaries[DICTIONARIES_NAMES[field.type]] ||
            this.props.dictionaries[GEO_DICTIONARIES[field.type]] ||
            pathOr([], ['settings', 'choices'], field)
                .map(({ value, id, translations }) => ({ label: value, value: id, translations: translations && translations.choices }));

        if (isEmpty(options)) {
            return [];
        }

        if (language === RU) {
            return options;
        } else {
            return options.map(option => ({
                ...option,
                label: translateOptionLabel(option, language)
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

    onChange = (_, field) => {
        const values = this.props.formProps.form.getState().values;
        const html = path(['personalDataAgreement', 'htmlContent'], values);

        if (includes(field.field, this.props.updateOpdValuesOn) && html) {
            const opdValues = this.props.getOpdValues ? this.props.getOpdValues({ values }) : {};

            const container = document.createElement('div');
            container.innerHTML = html;
            const el = container.querySelector('.opd-html-form');
            const form = document.createElement('div');
            form.append(el);
            const inputs = form.querySelectorAll('input');

            forEach(input => {
                const value = path([input.name], opdValues);
                if (value) {
                    input.setAttribute('value', trim(`${value || ''}`));
                }
            }, inputs);

            this.props.formProps.form.change('personalDataAgreement.htmlContent', getHtml(form.innerHTML));
        }
    }

    renderField = (field, name, form) => {
        const {
            opd,
            opdSettings,
            getFileUrl,
            postFileUrl,
            apiUrl,
            company,
            language,
            components,
            htmlOpd,
            getOpdValues,
            serverErrors,
            fields,
            allowFileExtensions,
            renderOpdLabel,
            fieldsWithoutValidation,
            errors,
            changeFieldValidation,
            selectHeight,
            selectLineHeight,
            updateOpdValues
        } = this.props;
        const fieldName = name || field.field;
        const isLinked = isLinkedField(field);

        const validateField = (value, form) => validate(value, form, field, fieldsWithoutValidation, this.props, { htmlOpd, allowFileExtensions });

        const renderLinkedField = (props = {}) => (
            <Field
                name={fieldName}
                component={getFieldComponent(field, components) || (() => null)}
                fieldType={field.type}
                options={this.getOptions(field)}
                opd={opd}
                opdSettings={opdSettings}
                company={company}
                language={language}
                validate={validateField}
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
                changeFieldValidation={changeFieldValidation}
                serverErrors={serverErrors}
                fields={fields}
                allowFileExtensions={allowFileExtensions}
                renderOpdLabel={renderOpdLabel}
                selectHeight={selectHeight}
                selectLineHeight={selectLineHeight}
                updateOpdValues={updateOpdValues}
                onChange={value => this.onChange(value, field)}
                {...props}
            />
        );

        return isLinked ? (
            <LinkedFieldWrapper field={field} form={form}>
                { renderLinkedField }
            </LinkedFieldWrapper>
        ) : (
            <Field
                name={fieldName}
                component={getFieldComponent(field, components) || (() => null)}
                fieldType={field.type}
                options={this.getOptions(field)}
                opd={opd}
                opdSettings={opdSettings}
                validate={validateField}
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
                changeFieldValidation={changeFieldValidation}
                serverErrors={serverErrors}
                fields={fields}
                allowFileExtensions={allowFileExtensions}
                renderOpdLabel={renderOpdLabel}
                selectHeight={selectHeight}
                selectLineHeight={selectLineHeight}
                language={language}
                onChange={value => this.onChange(value, field)}
            />
        );
    }

    renderCompositeRemoveButton = (field, index) => {
        if (field.required) {
            return index !== 0;
        } else {
            return true;
        }
    }

    render() {
        const { fields, language, formProps, formRender, t, disabled } = this.props;

        const FormRender = formRender || defaultFormRender;

        return (
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
                                                                { this.renderField(question, `${name}.${question.field}`, formProps.form) }
                                                            </div>
                                                        )}
                                                        { this.renderCompositeRemoveButton(field, index) && (
                                                            <button
                                                                disabled={disabled}
                                                                className={styles.formSectionBtn}
                                                                type='button'
                                                                onClick={() => fieldProps.fields.remove(index)}
                                                            >
                                                                { t('remove') }
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <button disabled={disabled} className={styles.formSectionBtn} type='button' onClick={() => fieldProps.fields.push({})}>{t('addQuestionBlock')}</button>
                                            </div>
                                        }
                                    </FieldArray> :
                                    pathOr([], ['settings', 'questions'], field).map(question =>
                                        <div key={`${field.field}-${question.field}`}>
                                            { this.renderField(question, `${field.field}.${question.field}`, formProps.form) }
                                        </div>
                                    )
                                }
                            </Fragment> :
                            this.renderField(field, null, formProps.form)
                        }
                    </div>
                }
            />
        );
    }
}

export default withTranslation()(Fields);
