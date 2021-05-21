/* eslint-disable no-mixed-operators */
import '../utils/i18n';
import i18n from '../utils/i18n';
/* eslint-disable no-template-curly-in-string */

import React, { Component } from 'react';
import { Form as FinalFormForm, Field, FormSpy } from 'react-final-form';
import { pathOr, prop, equals, isEmpty, forEach, path, includes, assocPath} from 'ramda';
import arrayMutators from 'final-form-arrays';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import '../styles/index.css';
import styles from '../styles/index.module.css';

import { RU } from '../constants/translations';
import { isLinkedQuestion, findChildGeoQuestionsNames } from '../utils/questions';
import { getAttrs } from '../utils/attrs';
import { CompanyDictionaryContext } from '../context/CompanyDictionary';
import { FormContext } from '../context/FormContext';
import Fields from './Fields';
import Spinner from './formComponents/Spinner';
import Captcha from './formComponents/Captcha';

const getInitialValues = (initialValues, fields, captchaOptions) => {
    let values = initialValues || {};

    forEach(field => {
        if (field.type === 'boolean' && !values[field.field]) {
            values[field.field] = false;
        }
    }, fields || []);

    if (path(['captchaToken'], captchaOptions) && includes(path(['captchaType'], captchaOptions), ['math', 'symbols'])) {
        values = assocPath(['_captcha', 'key'], captchaOptions.captchaToken, values);
    }

    return values;
};

class Form extends Component {
    static defaultProps = {
        fields: [],
        dictionaryOptions: {},
        components: {},
        language: RU,
        opdSubmitDisabled: true,
        excludeDictionary: {},
        renameDictionary: {},
        options: {},
        selectHeight: 34,
        selectLineHeight: 18,
    };

    constructor(props) {
        super(props);

        const language = props.language || RU;

        this.state = {
            language,
            dictionaries: {},
            errors: {},
            initialValues: getInitialValues(props.initialValues, props.fields, props.captchaOptions),
            fieldsWithoutValidation: {},
            options: {},
            submitted: false,
        };

        this.dictionaryTypes = [];
        this.formProps = null;

        i18n.changeLanguage(language);

        if (props.translations) {
            i18n.addResources('ru', 'translation', pathOr({}, ['ru', 'translation'], props.translations));
            i18n.addResources('en', 'translation', pathOr({}, ['en', 'translation'], props.translations));
            i18n.addResources('ua', 'translation', pathOr({}, ['ua', 'translation'], props.translations));
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
        const { language: languageProps, initialValues, serverErrors, fields, captchaOptions } = this.props;

        if (languageProps !== language) {
            this.setState({ language: languageProps }, () => {
                i18n.changeLanguage(this.state.language);
            });
        }

        if (!equals(getInitialValues(initialValues, fields, captchaOptions),
            getInitialValues(prevProps.initialValues, prevProps.fields, prevProps.captchaOptions))) {
            this.setState({ initialValues: getInitialValues(initialValues, fields, captchaOptions) });
        }

        if (serverErrors && !prevProps.serverErrors && this.state.submitted) {
            this.setState({ submitted: false });
        }

        if (!prevProps.serverErrors && serverErrors) {
            this.scrollToInvalidField();
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

    reset = () => {
        this.formProps.reset();
        this.setState({ submitted: false, errors: {} });
    }

    onSubmit = values => {
        this.setState({ submitted: true });
        this.props.onSubmit(values, { ...this.formProps, reset: this.reset });
    };

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
                input.focus({ preventScroll: true });
            }
        }
    }

    handleSubmit = (e, handleSubmit) => {
        this.scrollToInvalidField();
        handleSubmit(e);
    }

    render() {
        const {
            fields,
            language,
            opdSubmitDisabled,
            formRender,
            t,
            disabled: externalDisabled,
            submitting: externalSubmitting,
            serverErrors,
            htmlAttrs,
            captcha,
            captchaOptions
        } = this.props;
        const contextValue = {
            options: this.state.options,
            changeOptions: this.changeOptions,
        };

        return <div className={cx(styles.formWrapper, { 'jobot-form-server-failed': !!serverErrors })} ref={node => this.container = node}>
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
                        const { handleSubmit, form: finalForm, submitFailed, submitting } = formProps;
                        const submitted = this.state.submitted || submitting || !!externalSubmitting;
                        const disabled = submitted || !!externalDisabled;

                        if (!this.formProps) {
                            this.formProps = finalForm;
                        }

                        return <form
                            className={submitFailed ? 'jobot-form-submit-failed' : ''}
                            onSubmit={e => this.handleSubmit(e, handleSubmit)}
                            ref={this.props.formRef}
                            noValidate
                        >
                            <FormContext.Provider value={{ disabled, htmlAttrs }}>
                                <FormSpy
                                    subscription={{ submitFailed: true }}
                                    onChange={this.onChangeSubmitFailed} />
                                <Fields
                                    formRender={formRender}
                                    formProps={formProps}
                                    fields={fields}
                                    disabled={disabled}
                                    components={this.props.components}
                                    opd={this.props.opd}
                                    opdLabelType={this.props.opdLabelType}
                                    getFileUrl={this.props.getFileUrl}
                                    postFileUrl={this.props.postFileUrl}
                                    apiUrl={this.props.apiUrl}
                                    allowFileExtensions={this.props.allowFileExtensions}
                                    serverErrors={this.props.serverErrors}
                                    htmlOpd={this.props.htmlOpd}
                                    getOpdValues={this.props.getOpdValues}
                                    renderOpdLabel={this.props.renderOpdLabel}
                                    setFormState={mutate => this.setState(mutate)}
                                    changeOptions={this.changeOptions}
                                    changeFieldValidation={this.changeFieldValidation}
                                    options={this.state.options}
                                    dictionaries={this.state.dictionaries}
                                    fieldsWithoutValidation={this.state.fieldsWithoutValidation}
                                    errors={this.state.errors}
                                    language={language}
                                />
                                <div>
                                    { !!captcha && captcha !== 'none' &&
                                        <Field
                                            key={language}
                                            name='_captcha.value'
                                            component={Captcha}
                                            validate={value => value ? undefined : i18n.t('errors.captchaRequired')}
                                            language={language}
                                            options={captchaOptions} />
                                    }
                                    <Field name='personalDataAgreement' subscription={{ value: true }}>
                                        {({ input: { value } }) => (
                                            <button
                                                className={styles.formBtn}
                                                type='submit'
                                                disabled={(opdSubmitDisabled && !value) || submitted || disabled}
                                                {...getAttrs('submit', htmlAttrs)}
                                            >
                                                { submitted && <Spinner /> }
                                                <span className='button-text'>
                                                    { t('send') }
                                                </span>
                                            </button>
                                        )}
                                    </Field>
                                </div>
                            </FormContext.Provider>
                        </form>;
                    }}
                </FinalFormForm>
            </CompanyDictionaryContext.Provider>
        </div>;
    }
}

export default withTranslation()(Form);
