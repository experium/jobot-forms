import React, { Component, Fragment } from 'react';
import { allPass, prop, path, contains, find, propEq, filter, equals, isEmpty, includes, pathOr, without, append } from 'ramda';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import ReactSelect from 'rc-select';

import '../../styles/rcselect.css';
import '../../styles/select.css';
import styles from '../../styles/index.module.css';

import { GEO_DICTIONARIES_TYPES } from '../../constants/dictionaries';
import withFieldWrapper from '../hocs/withFieldWrapper';
import withLocationValues from '../hocs/withLocationValues';

export const sorterByLabel = (optionA, optionB) => optionA.label.localeCompare(optionB.label);

class Select extends Component {
    constructor(props) {
        super(props);

        this.state = {
            other: props.settings.userValueAllowed && !props.settings.multiple && props.input.value === (props.settings.userValueQuestion || 'Другое')
        };

        this.selectContainer = React.createRef();
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
            this.onChange(undefined);
        }

        const newRequiredStatus = !isEmpty(options);

        if (newRequiredStatus !== required) {
            toggleRequired(newRequiredStatus);
        }

        if (fieldsWithoutValidation[name] !== isEmpty(options) && !isEmpty(propsOptions)) {
            changeFieldValidation(name, isEmpty(options));
        }
    }

    onChange = value => {
        const { settings, onChange } = this.props;
        const multiple = path(['multiple'], settings);

        if (multiple) {
            onChange(value && value.length ? value : undefined);
        } else {
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

    getUserValueQuestion = () => {
        const value = this.props.settings.userValueQuestion || this.props.t('otherOption');

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
                    const regionEqual = regionParent ? regionParent === item.region : true;
                    const countryEqual = countryParent ? countryParent === item.country : true;

                    return regionEqual && countryEqual;
                } else {
                    return true;
                }
            },
            item => {
                if (prop('length', settings.countries) || prop('length', settings.regions)) {
                    return (
                        contains(item.region, settings.regions || [])
                        || contains(item.country, settings.countries || [])
                    );
                } else {
                    return true;
                }
            },
            item => {
                if (settings.selection && settings.selection.length) {
                    return contains(item.value, settings.selection) || contains(item.internalId, settings.selection);
                } else {
                    return true;
                }
            },
        ]), options);

        return this.allowUserValue() ? [...filteredOptions, this.getUserValueQuestion()] : filteredOptions;
    }

    render() {
        const { input: { value, name }, settings, errors, dictionaryType, t, disabled } = this.props;
        const multiple = path(['multiple'], settings);
        const placeholder = path(['placeholder'], settings);
        const options = this.getOptions() || [];
        const isError = errors[dictionaryType];

        return <div ref={this.selectContainer} id={`${name}-select`}>
            <ReactSelect
                id={name}
                key={value}
                value={(this.allowUserValue() && this.state.other ? this.getUserValueQuestion().value : value) || undefined}
                onChange={this.onChange}
                showSearch={options.length > 10}
                filterSort={sorterByLabel}
                optionFilterProp='label'
                placeholder={placeholder}
                notFoundContent={t('noOptionsMessage')}
                prefixCls='jobot-forms-rc-select'
                disabled={disabled}
                options={options}
                mode={multiple ? 'multiple' : 'single'}
                {...(isError ? { open: false } : {})}
                virtual
                allowClear
                showArrow
                getPopupContainer={() => this.selectContainer.current}
            />
            { this.allowUserValue() && this.state.other &&
                <input
                    className={`input ${styles.formInput}`}
                    style={{ marginTop: 10 }}
                    value={pathOr('', ['userValue'], value)}
                    onChange={this.onChangeOther} />
            }
        </div>;
    }
}

const SelectComponent = withFieldWrapper(withTranslation()(Select));

export default SelectComponent;

export const LocationSelect = withLocationValues(SelectComponent);
