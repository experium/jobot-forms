import React, { Component, Fragment } from 'react';
import ReactSelect, { components } from 'react-select';
import { path, contains, find, propEq, filter, findIndex, equals, take, isEmpty, includes, pathOr } from 'ramda';
import { VariableSizeList as List } from 'react-window';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import '../../styles/select.css';

import { GEO_DICTIONARIES_TYPES } from '../../constants/dictionaries';
import withFieldWrapper from '../hocs/withFieldWrapper';
import withLocationValues from '../hocs/withLocationValues';
import styles from '../../styles/index.module.css';

export const HEIGHT = 34;

class Select extends Component {
    constructor(props) {
        super(props);

        this.state = {
            other: props.settings.userValueAllowed && !props.settings.multiple && props.input.value === (props.settings.userValueQuestion || 'Другое')
        };
    }

    componentDidMount() {
        if (this.props.dictionaryType) {
            this.fetchDictionary();
        }
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

        if (formValues && (
            !equals(formValues[settings.regionField], prev.formValues[prev.settings.regionField]) ||
            !equals(formValues[settings.countryField], prev.formValues[prev.settings.countryField])
        )) {
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
            const value = path(['value'], data) || undefined;
            const userValueQuestion = this.getUserValueQuestion().value;

            onChange(this.allowUserValue() && value === userValueQuestion ? undefined : value);
            this.allowUserValue() && this.setState({ other: value === userValueQuestion });
        }
    }

    onChangeOther = e => {
        this.props.onChange(e.target.value ? {
            value: 'Иное',
            userValue: e.target.value,
        } : undefined);
    }

    getOptionsHeight = childrens => {
        if (Array.isArray(childrens)) {
            return (childrens.length * HEIGHT) + 1;
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

    getUserValueQuestion = () => {
        const value = this.props.settings.userValueQuestion || 'Другое';

        return { label: value, value };
    }

    allowUserValue = () => {
        return this.props.settings.userValueAllowed && !this.props.settings.multiple;
    }

    getOptions = () => {
        const { settings, options, formValues } = this.props;

        if (formValues && !formValues[settings.regionField] && !formValues[settings.countryField] && !formValues.country || !formValues) {
            return this.allowUserValue() ? [...options, this.getUserValueQuestion()] : options;
        }

        const filteredOptions =  filter(item => {
            const regionEqual = formValues[settings.regionField] === item.region;
            const countryEqual = formValues[settings.countryField] === item.country;

            if (formValues && formValues[settings.regionField] && formValues[settings.countryField]) {
                return regionEqual && countryEqual;
            } else if (formValues && formValues[settings.regionField]) {
                return regionEqual;
            } else if (formValues && formValues[settings.countryField]) {
                return countryEqual;
            } else if (formValues && settings.regionField && formValues.country) {
                return formValues.country === item.country;
            } else {
                return true;
            }
        }, options);

        return this.allowUserValue() ? [...filteredOptions, this.getUserValueQuestion()] : filteredOptions;
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
        const { input: { value, name }, settings, errors, dictionaryType, t, disabled } = this.props;
        const multiple = path(['multiple'], settings);
        const placeholder = path(['placeholder'], settings);
        const options = this.getOptions() || [];
        const MenuList = this.getMenuList(options);
        const isError = errors[dictionaryType];

        return <Fragment>
            <ReactSelect
                id={name}
                key={value}
                value={this.allowUserValue() && this.state.other ?
                    this.getUserValueQuestion() : multiple ?
                        filter(item => includes(item.value, value || []), options) : find(propEq('value', value), options)
                }
                options={options}
                placeholder={placeholder}
                onChange={this.onChange}
                isMulti={multiple}
                isSearchable={options.length > 10}
                placeholder={null}
                noOptionsMessage={() => t('noOptionsMessage')}
                classNamePrefix='jobot-forms'
                maxMenuHeight={HEIGHT * 6}
                openMenuOnClick={!isError}
                components={{
                    MenuList,
                    IndicatorSeparator: () => null,
                    DropdownIndicator: this.getDropdownIndicator,
                }}
                isDisabled={disabled}
                isClearable />
            { this.allowUserValue() && this.state.other &&
                <input
                    className={`input ${styles.formInput}`}
                    style={{ marginTop: 10 }}
                    value={pathOr('', ['userValue'], value)}
                    onChange={this.onChangeOther} />
            }
        </Fragment>;
    }
}

const SelectComponent = withFieldWrapper(withTranslation()(Select));

export default SelectComponent;

export const LocationSelect = withLocationValues(SelectComponent);
