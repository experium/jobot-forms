import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { path, contains, find, propEq, filter, findIndex, equals, take, isEmpty } from 'ramda';
import { VariableSizeList as List } from 'react-window';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import withFieldWrapper from '../hocs/withFieldWrapper';
import { GEO_DICTIONARIES_TYPES } from '../../constants/dictionaries';
import withFormValues from '../hocs/withFormValues';

export const HEIGHT = 33;

class Select extends Component {
    static defaultProps = {
        options: []
    };

    componentDidMount() {
        this.fetchDictionary();
    }

    fetchDictionary = () => {
        const { dictionaryType, getDictionary } = this.props;

        if (contains(dictionaryType, GEO_DICTIONARIES_TYPES)) {
            getDictionary(dictionaryType, 'items', qs.stringify({ pagination: JSON.stringify({ limit: 0 })}, { addQueryPrefix: true }));
        } else {
            getDictionary(dictionaryType);
        }
    }

    componentDidUpdate(prev) {
        const {
            settings,
            formValues,
            required,
            toggleRequired,
            fieldsWithoutValidation,
            changeFieldValidation,
            input: {
                name
            },
            options: propsOptions
        } = this.props;
        const options = this.getOptions();

        if (!equals(formValues[settings.regionField], prev.formValues[prev.settings.regionField]) ||
            !equals(formValues[settings.countryField], prev.formValues[prev.settings.countryField])
        ) {
            this.onChange({ value: undefined });
        }

        const newRequiredStatus = !isEmpty(options);

        if (newRequiredStatus !== required) {
            toggleRequired(newRequiredStatus);
        }

        if (fieldsWithoutValidation[name] !== isEmpty(options) && !isEmpty(propsOptions)) {
            changeFieldValidation(name, isEmpty(options));
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

        if (!formValues[settings.regionField] && !formValues[settings.countryField] && !formValues.country) {
            return options;
        }

        const filteredOptions =  filter(item => {
            const regionEqual = formValues[settings.regionField] === item.region;
            const countryEqual = formValues[settings.countryField] === item.country;

            if (formValues[settings.regionField] && formValues[settings.countryField]) {
                return regionEqual && countryEqual;
            } else if (formValues[settings.regionField]) {
                return regionEqual;
            } else if (formValues[settings.countryField]) {
                return countryEqual;
            } else if (settings.regionField && formValues.country) {
                return formValues.country === item.country;
            } else {
                return true;
            }
        }, options);

        return filteredOptions;
    }

    getDropdownIndicator = (props) => {
        const { errors, dictionaryType } = this.props;
        const { getStyles } = props;
        const isError = errors[dictionaryType];

        return isError ? (
            <div style={getStyles('dropdownIndicator', props)}>
                <div
                    className='error-indicator'
                    onClick={this.fetchDictionary}
                >
                    <div className='error-icon'>!</div>
                </div>
            </div>
        ) : (
            <components.DropdownIndicator {...props} />
        );
    }

    render() {
        const { input: { value }, settings, errors, dictionaryType, t } = this.props;
        const multiple = path(['multiple'], settings);
        const options = this.getOptions();
        const MenuList = this.getMenuList(options);
        const isError = errors[dictionaryType];

        return <ReactSelect
            key={value}
            classNamePrefix='search-input'
            value={multiple ? filter(item => contains(item.value, value || []), options) : find(propEq('value', value), options)}
            options={options}
            onChange={this.onChange}
            isMulti={multiple}
            isSearchable={options.length > 10}
            placeholder={null}
            noOptionsMessage={() => t('noOptionsMessage')}
            classNamePrefix='jobot-forms'
            maxMenuHeight={HEIGHT * 6}
            noOptionsMessage={() => 'Нет данных'}
            openMenuOnClick={!isError}
            components={{
                MenuList,
                IndicatorSeparator: () => null,
                DropdownIndicator: this.getDropdownIndicator,
            }} />;
    }
}

export default withFieldWrapper(withFormValues(withTranslation()(Select)));
