import React, { Component } from 'react';
import { contains } from 'ramda';

import styles from '../../styles/index.module.css';

export default WrappedComponent =>
    class FieldWrapper extends Component {
        onChange = value => {
            this.props.input.onChange(value);
        }

        hideLabel = () => {
            const { fieldType, label } = this.props;
            const HIDE_TYPES = ['boolean', 'personalDataAgreement'];

            return contains(fieldType, HIDE_TYPES) || !label;
        }

        render() {
            const { label, required, meta: { submitFailed, error }} = this.props;

            return <div style={{ marginBottom: 20 }}>
                { !this.hideLabel() &&
                    <label className={required ? styles.formLabelRequired : styles.formLabel}>
                        { label }
                    </label>
                }
                <div>
                    <WrappedComponent {...this.props} onChange={this.onChange} />
                </div>
                { submitFailed && error && <div className={styles.error}>{ error }</div> }
            </div>;
        }
    };
