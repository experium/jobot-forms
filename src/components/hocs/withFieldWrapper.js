import React, { Component } from 'react';
import { contains } from 'ramda';
import { Translation } from 'react-i18next';

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
                    <label className={styles.formLabel}>
                        { label }{ !required && (
                            <span className={styles.formLabelOptional}>
                                <Translation>
                                    { (t) => t('optional') }
                                </Translation>
                            </span>
                        )}
                    </label>
                }
                <div>
                    <WrappedComponent {...this.props} onChange={this.onChange} />
                </div>
                { submitFailed && error && <div className={styles.error}>{ error }</div> }
            </div>;
        }
    };
