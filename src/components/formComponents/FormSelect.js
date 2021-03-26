import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import ReactSelect from 'rc-select';
import { filter, path, contains } from 'ramda';

import styles from '../../styles/index.module.css';

const mapValueProp = values => (values || []).map(({ value }) => String(value));
const mapValueState = values => (values || []).map(value => ({ value }));

export default class FormSelect extends Component {
    static defaultProps = {
        useNative: true
    };

    state = {
        value: null
    };

    componentDidMount() {
        this.props.mode === 'multiple' && this.setState({ value: mapValueState(this.props.value) });
    }

    onChangeNative = e => {
        if (this.props.mode === 'multiple') {
            const values = filter(item => item.selected, e.target.options).map(item =>
                ({ value: isNaN(Number(item.value)) ? item.value : Number(item.value)})
            );

            this.setState({ value: values.length ? values : null });
        } else {
            this.props.onChange(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value));
        }
    }

    onBlurNative = () => {
        if (this.props.mode === 'multiple') {
            this.props.onChange(mapValueProp(this.state.value));
        }
    }

    isNativeOptionSelected = value => {
        if (!this.props.value) {
            return false;
        }

        return this.props.mode === 'multiple' ?
            this.props.value && this.props.value.length && contains(value, this.props.value)
            : value === this.props.value;
    }

    render() {
        const { useNative, nativeStyles, ...props } = this.props;

        return isMobile().phone && useNative ?
            <select
                id={props.id}
                className={`select-input ${styles.formInput} ${props.className || ''}`}
                defaultValue={(
                    props.mode === 'multiple' ?
                        props.value
                        : props.value ?
                            String(props.value)
                            : undefined
                )}
                disabled={props.isDisabled}
                placeholder={props.placeholder}
                onChange={this.onChangeNative}
                onBlur={this.onBlurNative}
                style={nativeStyles}
                multiple={props.mode === 'multiple'}
            >
                { props.mode !== 'multiple' && <option value=''>Не выбрано</option> }
                { props.options.map((item, index) => (
                    <option key={item.value || index} value={item.value} selected={this.isNativeOptionSelected(item.value)}>
                        {item.label}
                    </option>
                ))}
            </select> :
            <ReactSelect {...props} />;
    }
}
