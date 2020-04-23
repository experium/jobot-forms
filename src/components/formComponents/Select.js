import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { path, contains, find, propEq, filter, findIndex, equals, take } from 'ramda';
import { VariableSizeList as List } from 'react-window';
import qs from 'qs';

import withFieldWrapper from '../hocs/withFieldWrapper';
import DICTIONARIES_NAMES, { GEO_DICTIONARIES } from '../../constants/dictionaries';
import withFormValues from '../hocs/withFormValues';

export const HEIGHT = 33;

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

        if (DICTIONARIES_NAMES[fieldType]) {
            getDictionary(DICTIONARIES_NAMES[fieldType]);
        }

        if (GEO_DICTIONARIES[fieldType]) {
            getDictionary(GEO_DICTIONARIES[fieldType], 'items', qs.stringify({ pagination: JSON.stringify({ limit: 0 })}, { addQueryPrefix: true }));
        }
    }

    componentDidUpdate(prev) {
        const { settings, formValues } = this.props;

        if (!equals(formValues[settings.regionField], prev.formValues[prev.settings.regionField]) ||
            !equals(formValues[settings.countryField], prev.formValues[prev.settings.countryField])
        ) {
            this.onChange({ value: undefined });
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

    getOptionsHeight = childrens => {
        if (Array.isArray(childrens)) {
            return childrens.length * HEIGHT;
        }

        return HEIGHT;
    }

    getOffset = (options, value) => {
        const index = findIndex(equals(value), options);

        return index < 0 ? 0 : this.getOptionsHeight(take(index, options));
    }

    getMenuList = options => ({ children, maxHeight, getValue }) => {
        const [ value ] = getValue();
        const optionsHeight = this.getOptionsHeight(children);

        const listHeight = options ? optionsHeight > maxHeight ? maxHeight : optionsHeight : 0;
        const initialOffset = optionsHeight > maxHeight ? this.getOffset(options, value) : 0;

        return <List
            height={listHeight}
            itemCount={children.length || 1}
            itemSize={() => HEIGHT}
            initialScrollOffset={initialOffset}>
            { ({ index, style }) => <div style={style}>{ Array.isArray(children) ? children[index] : children }</div> }
        </List>;
    }

    getOptions = () => {
        const { settings, options, formValues } = this.props;

        if (!formValues[settings.regionField] && !formValues[settings.countryField]) {
            return options;
        }

        return filter(item => {
            const regionEqual = formValues[settings.regionField] === item.region;
            const countryEqual = formValues[settings.countryField] === item.country;

            return formValues[settings.regionField] && formValues[settings.countryField] ? regionEqual && countryEqual :
                formValues[settings.regionField] ? regionEqual :
                    formValues[settings.countryField] ? countryEqual : true;
        }, options);
    }

    render() {
        const { input: { value }, settings, fieldType } = this.props;
        const multiple = path(['multiple'], settings);
        const options = this.getOptions();
        const MenuList = this.getMenuList(options);

        return <ReactSelect
            classNamePrefix='search-input'
            value={multiple ? filter(item => contains(item.value, value || []), options) : find(propEq('value', value), options)}
            options={options}
            onChange={this.onChange}
            isMulti={multiple}
            isSearchable={contains(fieldType, ['city', 'country'])}
            placeholder='Выберите значение...'
            classNamePrefix='jobot-forms'
            maxMenuHeight={HEIGHT * 6}
            components={{
                MenuList,
                IndicatorSeparator: () => null,
                NoOptionsMessage: () => <div className='no-options'>Нет данных</div>
            }} />;
    }
}

export default withFieldWrapper(withFormValues(Select));
