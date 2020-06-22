import React, { Component } from 'react';
import { contains } from 'ramda';

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

            this.setState({ required: required ? initialRequired || required : false });
        }

        onChange = value => {
            const { onChange, form } = this.props;
            this.props.input.onChange(value);

            onChange && onChange(value, form);
        }

        hideLabel = () => {
            const { fieldType, label } = this.props;
            const HIDE_TYPES = ['boolean', 'personalDataAgreement'];

            return contains(fieldType, HIDE_TYPES) || !label;
        }

        render() {
            const { label, meta: { submitFailed, error }, input: { value }} = this.props;
            const { required } = this.state;

            return <div style={{ marginBottom: 20 }}>
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
            </div>;
        }
    };
