import React, { Component } from 'react';
import { path } from 'ramda';
import AutosizeTextarea from 'react-textarea-autosize';
import { prop } from 'ramda';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';
import Masked from 'react-text-mask';
import { getMask } from '../../utils/mask';

class Input extends Component {
    static defaultProps = {
        fieldType: 'text'
    };

    onChange = e => this.props.onChange(e.target.value);

    render() {
        const { fieldType, input: { value }, settings, disabled } = this.props;
        const mask = prop('mask', settings);
        const inputMask = mask && getMask(mask);

        return path(['textarea'], settings) ? (
            <AutosizeTextarea
                className={`textarea ${styles.formTextarea}`}
                minRows={3}
                onChange={this.onChange}
                value={value}
                disabled={disabled}
            />
        ) : inputMask ? (
            <Masked
                className={`input ${styles.formInput}`}
                value={value}
                type={fieldType}
                onChange={this.onChange}
                mask={inputMask}
                placeholderChar={'\u2000'}
                keepCharPositions={false}
                disabled={disabled}
                guide
            />
        ) : (
            <input
                className={`input ${styles.formInput}`}
                value={value}
                type={fieldType}
                onChange={this.onChange}
                disabled={disabled}
            />
        );
    }
}

export default withFieldWrapper(Input);
