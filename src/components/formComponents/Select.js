import React, { Component, Fragment } from 'react';
import { components } from 'react-select';
import { allPass, prop, path, contains, find, propEq, filter, findIndex, equals, take, isEmpty, includes, pathOr, forEach } from 'ramda';
import { VariableSizeList as List } from 'react-window';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import '../../styles/select.css';

import { GEO_DICTIONARIES_TYPES } from '../../constants/dictionaries';
import withFieldWrapper from '../hocs/withFieldWrapper';
import withLocationValues from '../hocs/withLocationValues';
import styles from '../../styles/index.module.css';
import FormSelect from './FormSelect';

function countLines(name, text, selectHeight) {
    const el = document.createElement('div');
    el.style.width = `${document.getElementById(name).offsetWidth}px`;
    el.style.lineHeight = `${selectHeight}px`;
    el.style.paddingLeft = '11px';
    el.style.paddingRight = '11px';
    el.className = 'jobot-forms_select-count-lines-item';
    el.innerHTML = text;
    document.body.appendChild(el);

    const divHeight = el.offsetHeight;
    const lineHeight = parseInt(el.style.lineHeight);
    const lines = divHeight / lineHeight;

    el.parentNode.removeChild(el);

    return lines;
}

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
        } else if (dictionaryType) {
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
            const { selectLineHeight, selectHeight, input } = this.props;
            let height = 0;

            forEach(child => {
                height = height + selectHeight + ((countLines(input.name, (child.label || child.props.data.label), selectHeight) - 1) * selectLineHeight);
            }, childrens);

            return height;
        }

        return this.props.selectHeight;
    }

    getOffset = (options, value) => {
        const index = findIndex(equals(value), options);

        return index < 0 ? 0 : this.getOptionsHeight(take(index, options));
    }

    getMenuList = options => ({ children, maxHeight, getValue }) => {
        const { selectLineHeight, selectHeight, input } = this.props;
        const [ value ] = getValue();
        const optionsHeight = this.getOptionsHeight(children);

        const listHeight = options ? optionsHeight > maxHeight ? maxHeight : optionsHeight : 0;
        const initialOffset = optionsHeight > maxHeight ? this.getOffset(options, value) : 0;

        return <List
            height={listHeight}
            itemCount={children.length || 1}
            itemSize={index => selectHeight + ((countLines(input.name, options[index].label, selectHeight) - 1) * selectLineHeight)}
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
        const regionParent = prop(settings.regionField, formValues);
        const countryParent = prop(settings.countryField, formValues);

        const filteredOptions = filter(allPass([
            item => {
                if (countryParent || countryParent) {
                    const regionEqual = regionParent === item.region;
                    const countryEqual = countryParent === item.country;

                    return regionEqual || countryEqual;
                } else {
                    return true;
                }
            },
            item => {
                if (settings.countries || settings.regions) {
                    return (
                        contains(item.region, settings.regions || [])
                        || contains(item.country, settings.countries || [])
                    );
                } else {
                    return true;
                }
            },
            item => {
                if (settings.selection) {
                    return contains(item.value, settings.selection);
                } else {
                    return true;
                }
            },
        ]), options);
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
        const { input: { value, name }, settings, errors, dictionaryType, t, disabled, useNative, selectHeight } = this.props;
        const multiple = path(['multiple'], settings);
        const placeholder = path(['placeholder'], settings);
        const options = this.getOptions() || [];
        const MenuList = this.getMenuList(options);
        const isError = errors[dictionaryType];

        return <Fragment>
            <FormSelect
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
                maxMenuHeight={selectHeight * 6}
                openMenuOnClick={!isError}
                components={{
                    MenuList,
                    IndicatorSeparator: () => null,
                    DropdownIndicator: this.getDropdownIndicator,
                }}
                isDisabled={disabled}
                useNative={useNative}
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
