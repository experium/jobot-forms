import React, { Component } from 'react';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.css';

class Input extends Component {
    static defaultProps = {
        fieldType: 'text'
    };

    onChange = e => this.props.onChange(e.target.value);

    render() {
        const { fieldType, input: { value }} = this.props;

        return <input
            className={styles.formInput}
            value={value}
            type={fieldType}
            onChange={this.onChange} />;
    }
}

export default withFieldWrapper(Input);
