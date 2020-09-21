import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RcRadio from 'rc-checkbox';
import { isEmpty, path } from 'ramda';
import 'rc-checkbox/assets/index.css';

import withFieldWrapper from '../hocs/withFieldWrapper';

class RadioComponent extends Component {
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
        const { input: { onChange } } = this.props;

        onChange(target.value);
    }

    render() {
        const { input: { value = [], name }, options, disabled } = this.props;

        return options && !isEmpty(options) ? (
            <div className='radio-block'>
                { options.map(({ value: checkboxValue, label }) => {
                    return (
                        <label className='radio-wrapper' key={label}>
                            <RcRadio
                                id={name}
                                onChange={this.onChange}
                                className='radio'
                                checked={checkboxValue === value}
                                value={checkboxValue}
                                disabled={disabled}
                            />
                            <div className='radio-label'>
                                { label }
                            </div>
                        </label>
                    );
                })}
            </div>
        ) : null;
    }
}

const Radio = withFieldWrapper(RadioComponent);

export default Radio;
