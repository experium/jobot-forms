import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { path, contains, find, propEq, filter } from 'ramda';

import withFieldWrapper from '../hocs/withFieldWrapper';

const DICTIONARIES = {
    city: 'TownList',
    country: 'CountryList'
};

class Select extends Component {
    static defaultProps = {
        options: []
    };

    componentDidMount() {
        const { settings, getDictionary, fieldType } = this.props;
        const dictionary = path(['dictionary'], settings);

        if (dictionary) {
            getDictionary(dictionary);
        }

        if (DICTIONARIES[fieldType]) {
            getDictionary(DICTIONARIES[fieldType]);
        }
    }

    onChange = (data) => {
        const { settings, onChange } = this.props;
        const multiple = path(['multiple'], settings);

        if (multiple) {
            onChange(data && data.length ? data.map(({ value }) => value) : undefined);
        } else {
            onChange(data.value || undefined);
        }
    }

    render() {
        const { options, input: { value }, settings, fieldType } = this.props;
        const multiple = path(['multiple'], settings);

        return <ReactSelect
            value={multiple ? filter(item => contains(item.value, value || []), options) : find(propEq('value', value), options)}
            options={options}
            onChange={this.onChange}
            isMulti={multiple}
            isSearchable={contains(fieldType, ['city', 'country'])}
            noOptionsMessage={() => 'Нет данных'}
            placeholder='Выберите значение...'
            classNamePrefix='jobot-forms' />;
    }
}

export default withFieldWrapper(Select);
