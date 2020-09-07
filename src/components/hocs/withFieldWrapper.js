import React, { Component, Fragment } from 'react';
import { contains, find, propEq, propOr, path, prop } from 'ramda';
import cx from 'classnames';

import { isLinkedField } from '../../utils/field';
import { FormContext } from '../../context/FormContext';
import styles from '../../styles/index.module.css';

export default WrappedComponent =>
    class FieldWrapper extends Component {
        constructor(props) {
            super(props);

            this.state = {
                required: this.props.required,
                errorFromInput: undefined,
            };
        }

        toggleRequired = (required) => {
            const { initialRequired, settings } = this.props;
            const isLinked = isLinkedField({ settings });

            !isLinked && initialRequired && this.setState({ required: required ? initialRequired || required : false });
        }

        onChange = value => {
            const { onChange, field, form, form: { resetFieldState }, meta: { modified, submitting } } = this.props;
            const serverError = this.getServerError();

            if (!submitting) {
                this.props.input.onChange(value);
                onChange && onChange(value, form);
            }

            if (serverError && modified) {
                resetFieldState(field);
            }
        }

        hideLabel = () => {
            const { fieldType, label } = this.props;
            const HIDE_TYPES = ['boolean', 'personalDataAgreement'];

            return contains(fieldType, HIDE_TYPES) || !label;
        }

        getServerError = () => {
            const { input: { name }, serverErrors } = this.props;
            const gqlErrors = prop('graphQLErrors', serverErrors);

            if (!serverErrors) {
                return undefined;
            }

            const errors = Array.isArray(serverErrors) ? serverErrors : path(['data', 'errors'], serverErrors);

            if (gqlErrors) {
                const validationErrors = find(propEq('message', 'Validation failed'), gqlErrors);
                const errors = propOr({}, 'errors', validationErrors);

                return path([name, 0, 'message'], errors);
            }

            if (Array.isArray(errors)) {
                const fieldErrorObj = find(propEq('field', name), errors);

                return prop('message', fieldErrorObj);
            }
        }

        setInputError = (errorFromInput) => this.setState({ errorFromInput });

        renderError = () => {
            const { meta: { error, submitFailed, modifiedSinceLastSubmit, dirtySinceLastSubmit } } = this.props;
            const { errorFromInput } = this.state;
            const serverError = this.getServerError();
            const showServerError = !modifiedSinceLastSubmit && !dirtySinceLastSubmit && serverError;

            if (errorFromInput) {
                return <div className={styles.error}>{ errorFromInput }</div>;
            } else if (showServerError) {
                return <div className={styles.error}>{ serverError }</div>;
            } else {
                return submitFailed && error ? <div className={styles.error}>{ error }</div> : null;
            }
        }

        render() {
            const { label, extra = '', meta: { error, modifiedSinceLastSubmit, dirtySinceLastSubmit }, settings, input: { value } } = this.props;
            const serverError = this.getServerError();
            const isLinked = isLinkedField({ settings });
            const required = isLinked ? this.props.required : this.state.required;
            const showServerError = !modifiedSinceLastSubmit && !dirtySinceLastSubmit && serverError;

            return <div style={{ marginBottom: 20 }} className={cx({ 'jobot-form-invalid': !!error || showServerError })}>
                { !this.hideLabel() &&
                    <label className={required ? styles.formLabelRequired : styles.formLabel}>
                        { label }
                        { extra }
                    </label>
                }
                <div>
                    <FormContext.Consumer>
                        { ({ disabled }) => (
                            <WrappedComponent
                                {...this.props}
                                disabled={disabled}
                                onChange={this.onChange}
                                toggleRequired={this.toggleRequired}
                                required={required}
                                setInputError={this.setInputError}
                            />
                        )}
                    </FormContext.Consumer>
                </div>
                { this.renderError() }
            </div>;
        }
    };
