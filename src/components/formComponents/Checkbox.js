import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import RcCheckbox from 'rc-checkbox';
import { path, isEmpty, contains, filter, prop } from 'ramda';
import cx from 'classnames';

import 'rc-checkbox/assets/index.css';
import 'react-responsive-modal/styles.css';

import withFieldWrapper from '../hocs/withFieldWrapper';

class CheckboxComponent extends Component {
    static propTypes = {
        value: PropTypes.array,
        disabled: PropTypes.bool,
        options: PropTypes.array,
    }

    static defaultProps = {
        value: [],
    }

    componentDidMount() {
        const { settings, getDictionary } = this.props;
        const dictionary = path(['dictionary'], settings);

        if (dictionary) {
            getDictionary(dictionary);
        }
    }

    onChange = ({ target }) => {
        const { input: { value, onChange }, settings, onValueChange, meta: { submitting }} = this.props;
        const multiple = prop('multiple', settings);

        if (submitting) {
            return;
        }

        if (onValueChange) {
            onValueChange(target.checked);
            return;
        }

        if (target.checked) {
            multiple ? onChange([...value, target.value]) : onChange(target.value);
        } else {
            const newValue = filter((value) => value !== target.value, value);

            isEmpty(newValue) ? onChange(undefined) : onChange(newValue);
        }
    }

    render() {
        const { input: { value = [], name }, options, disabled, settings, required, fieldType, htmlAttrs } = this.props;

        return options && !isEmpty(options) ? (
            <div className='checkbox-block' {...htmlAttrs}>
                { options.map(({ value: checkboxValue, label }) => {
                    return (
                        <label
                            id={`${name}-label`}
                            className={cx('checkbox-wrapper', { 'checkbox-wrapper-required': required || fieldType === 'personalDataAgreement' })}
                            key={label}
                        >
                            <RcCheckbox
                                id={name}
                                onChange={this.onChange}
                                className='checkbox'
                                defaultChecked={contains(checkboxValue, value)}
                                checked={prop('multiple', settings) ? contains(checkboxValue, value) : !!value}
                                value={checkboxValue}
                                disabled={disabled}
                            />
                            <div className='checkbox-label'>
                                { label }
                            </div>
                        </label>
                    );
                })}
            </div>
        ) : null;
    }
}

export const Checkbox = withFieldWrapper(CheckboxComponent);

export class Boolean extends Component {
    render() {
        return (
            <Checkbox
                {...this.props}
                options={[{
                    value: true,
                    label: this.props.label,
                }]}
            />
        );
    }
}

export default Checkbox;
