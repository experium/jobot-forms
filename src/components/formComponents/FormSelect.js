import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import ReactSelect from 'rc-select';
import { filter, path } from 'ramda';

import styles from '../../styles/index.module.css';

export default class FormSelect extends Component {
    static defaultProps = {
        useNative: true
    };

    state = {
        value: null
    };

    componentDidMount() {
        this.props.mode === 'multiple' && this.setState({ value: this.props.value });
    }

    onChange = e => {
        if (this.props.mode === 'multiple') {
            const values = filter(item => item.selected, e.target.options).map(item =>
                ({ value: isNaN(Number(item.value)) ? item.value : Number(item.value)})
            );

            this.setState({ value: values.length ? values : null });
        } else {
            this.props.onChange({ value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) });
        }
    }

    onBlur = () => {
        if (this.props.mode === 'multiple') {
            this.props.onChange(this.state.value);
        }
    }

    render() {
        const { useNative, nativeStyles, ...props } = this.props;

        return isMobile().phone && useNative ?
            <select
                id={props.id}
                className={`select-input ${styles.formInput}`}
                defaultValue={props.mode === 'multiple' ?
                    (props.value || []).map(({ value }) => String(value)) : path(['value'], props.value) ?
                        String(props.value.value) : undefined
                }
                disabled={props.isDisabled}
                placeholder={props.placeholder}
                onChange={this.onChange}
                style={nativeStyles}
                onBlur={this.onBlur}
                multiple={props.mode === 'multiple'}
            >
                { props.mode !== 'multiple' && <option value=''>Не выбрано</option> }
                { props.options.map((item, index) => (
                    <option key={item.value || index} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select> :
            <ReactSelect {...props} />;
    }
}
