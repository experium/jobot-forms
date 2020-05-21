import React, { Component } from 'react';
import { path } from 'ramda';
import AutosizeTextarea from 'react-textarea-autosize';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';

class Input extends Component {
    static defaultProps = {
        fieldType: 'text'
    };

    onChange = e => this.props.onChange(e.target.value);

    render() {
        const { fieldType, input: { value }, settings } = this.props;

        return path(['textarea'], settings) ?
            <AutosizeTextarea
                className={styles.formTextarea}
                minRows={3}
                onChange={this.onChange}
                value={value}  /> :
            <input
                className={styles.formInput}
                value={value}
                type={fieldType}
                onChange={this.onChange} />;
    }
}

export default withFieldWrapper(Input);
