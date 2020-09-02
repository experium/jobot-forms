import React, { Component } from 'react';
import { contains, find, propEq, propOr, path, prop } from 'ramda';
import cx from 'classnames';

import { isLinkedField } from '../../utils/field';
import { DisableContext } from '../../context/DisableContext';
import styles from '../../styles/index.module.css';

export default WrappedComponent =>
    class FieldWrapper extends Component {
        constructor(props) {
            super(props);

            this.state = {
                required: this.props.required,
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

        render() {
            const { label, extra = '', meta: { submitFailed, error, modifiedSinceLastSubmit, dirtySinceLastSubmit }, settings, input: { value } } = this.props;
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
                    <DisableContext.Consumer>
                        { ({ disabled }) => (
                            <WrappedComponent
                                {...this.props}
                                disabled={disabled}
                                onChange={this.onChange}
                                toggleRequired={this.toggleRequired}
                                required={required}
                            />
                        )}
                    </DisableContext.Consumer>
                </div>
                { submitFailed && error && <div className={styles.error}>{ error }</div> }
                { showServerError && <div className={styles.error}>{ serverError }</div> }
            </div>;
        }
    };
