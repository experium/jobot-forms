import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import ReactSelect from 'react-select';

import styles from '../../styles/index.module.css';
import { filter, path } from 'ramda';

export default class FormSelect extends Component {
    static defaultProps = {
        useNative: true
    };

    onChange = e => {
        if (this.props.isMulti) {
            const values = filter(item => item.selected, e.target.options).map(item =>
                ({ value: isNaN(Number(item.value)) ? item.value : Number(item.value)})
            );

            this.props.onChange(values.length ? values : null);
        } else {
            this.props.onChange({ value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) });
        }
    }

    render() {
        const { useNative, nativeStyles, ...props } = this.props;

        return isMobile().phone && useNative ?
            <select
                id={props.id}
                className={`select-input ${styles.formInput}`}
                value={props.isMulti ?
                    (props.value || []).map(({ value }) => String(value)) : path(['value'], props.value) ?
                        String(props.value.value) : undefined
                }
                disabled={props.isDisabled}
                placeholder={props.placeholder}
                onChange={this.onChange}
                style={nativeStyles}
                multiple={props.isMulti}
            >
                { !props.isMulti && <option value=''>Не выбрано</option> }
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
