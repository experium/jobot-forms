import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import ReactSelect from 'react-select';

import styles from '../../styles/index.module.css';
import { path } from 'ramda';

export default class FormSelect extends Component {
    static defaultProps = {
        useNative: true
    };

    render() {
        const { useNative, nativeStyles, ...props } = this.props;

        return isMobile().phone && useNative ?
            <select
                id={props.id}
                className={`select-input ${styles.formInput}`}
                value={path(['value'], props.value) ? String(props.value.value) : undefined}
                disabled={props.isDisabled}
                placeholder={props.placeholder}
                onChange={e => props.onChange({ value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) })}
                style={nativeStyles}
            >
                <option value=''>Не выбрано</option>
                { props.options.map((item, index) => (
                    <option key={item.value || index} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select> :
            <ReactSelect
                {...props} />;
    }
}
