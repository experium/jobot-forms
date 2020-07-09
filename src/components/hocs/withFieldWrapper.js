import React, { Component } from 'react';
import { contains, find, propEq, propOr, path, prop } from 'ramda';
import cx from 'classnames';

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
            const { initialRequired } = this.props;

            initialRequired && this.setState({ required: required ? initialRequired || required : false });
        }

        onChange = value => {
            const { onChange, field, form, form: { resetFieldState }, meta: { modified } } = this.props;
            const serverError = this.getServerError();
            this.props.input.onChange(value);

            onChange && onChange(value, form);

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

            if (gqlErrors) {
                const validationErrors = find(propEq('message', 'Validation failed'), gqlErrors);
                const errors = propOr({}, 'errors', validationErrors);

                return path([name, 0, 'message'], errors);
            }

            if (Array.isArray(serverErrors)) {
                const fieldErrorObj = find(propEq('field', name), serverErrors);

                return prop('message', fieldErrorObj);
            }
        }

        render() {
            const { label, meta: { submitFailed, error, modified, dirtySinceLastSubmit } } = this.props;
            const { required } = this.state;
            const serverError = this.getServerError();

            return <div style={{ marginBottom: 20 }} className={cx({ 'jobot-form-invalid': !!error })}>
                { !this.hideLabel() &&
                    <label className={required ? styles.formLabelRequired : styles.formLabel}>
                        { label }
                    </label>
                }
                <div>
                    <WrappedComponent
                        {...this.props}
                        onChange={this.onChange}
                        toggleRequired={this.toggleRequired}
                        required={required}
                    />
                </div>
                { submitFailed && error && <div className={styles.error}>{ error }</div> }
                { (modified || !dirtySinceLastSubmit) && serverError && <div className={styles.error}>{ serverError }</div> }
            </div>;
        }
    };
