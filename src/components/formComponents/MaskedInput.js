import React, { Component } from 'react';
import Masked from 'react-text-mask';

import withFieldWrapper from '../hocs/withFieldWrapper';
import { PHONE_MASK, PHONE_MASK_EIGHT } from '../../constants/masks';
import styles from '../../styles/index.module.css';
import { prop } from 'ramda';

class MaskedInputComponent extends Component {
    render() {
        const { input: { value }, onChange, mask } = this.props;

        return <Masked
            className={styles.formInput}
            value={value}
            onChange={onChange}
            mask={mask}
            placeholderChar={'\u2000'}
            keepCharPositions={false}
            guide />;
    }
}

const MaskedInput = withFieldWrapper(MaskedInputComponent);

export const PhoneInput = props => <MaskedInput {...props} mask={value => value && value[0] === '8' ? PHONE_MASK_EIGHT : PHONE_MASK} />;
