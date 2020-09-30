import React, { Component } from 'react';
import Masked from 'react-text-mask';

import styles from '../../styles/index.module.css';

import withFieldWrapper from '../hocs/withFieldWrapper';
import { getPhoneMask } from '../../utils/mask';

class MaskedInputComponent extends Component {
    render() {
        const { input: { value, name }, onChange, mask, disabled, placeholder } = this.props;

        return <Masked
            id={name}
            disabled={disabled}
            className={`${styles.formInput} input`}
            value={value}
            onChange={onChange}
            mask={mask}
            placeholderChar={'\u2000'}
            placeholder={placeholder}
            keepCharPositions={false}
            guide />;
    }
}

const MaskedInput = withFieldWrapper(MaskedInputComponent);

export const PhoneInput = props => {
    return (
        <MaskedInput
            {...props}
            mask={getPhoneMask}
            showMask={true}
            guide={true}
            placeholder='+'
        />
    );
};
