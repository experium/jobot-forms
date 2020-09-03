import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { path, contains, find, propEq, filter, prop, propOr, pathOr, isEmpty, pathEq } from 'ramda';
import { Field } from 'react-final-form';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import { CompanyDictionaryContext } from '../../context/CompanyDictionary';
import withFieldWrapper from '../hocs/withFieldWrapper';

class Select extends Component {
    state = {
        options: {},
        loading: false,
        error: false,
    }

    getDictionary = async (dictionaryId, parentId) => {
        const { settings: { parentType,  parent }  } = this.props;
        const isDictionaryLink = parentType === 'parent';

        if (!this.state.loading) {
            const { apiUrl, field, changeContextOptions } = this.props;
            this.setState({ loading: true, error: false });

            const urlParams = isDictionaryLink ? (
                qs.stringify({
                    filter: {
                        dictionary: dictionaryId,
                        parent,
                    },
                    pagination: JSON.stringify({ limit: 0 }),
                    relations: ['parent']
                }, { addQueryPrefix: true })
            ) : (
                qs.stringify({
                    filter: {
                        dictionary: dictionaryId,
                        parent: Array.isArray(parentId) ? undefined : parentId,
                        parents: Array.isArray(parentId) ? parentId : undefined
                    },
                    pagination: JSON.stringify({ limit: 0 }),
                    relations: ['parent']
                }, { addQueryPrefix: true })
            );

            try {
                const response = await fetch(`${apiUrl || ''}/api/company-dictionary-item${urlParams}`);
                const responseData = propOr([], 'items', await response.json());
                const dictionaryKey = parentId || dictionaryId;

                this.setState({
                    options: {
                        [dictionaryKey]: responseData,
                    },
                    loading: false,
                }, () => changeContextOptions && changeContextOptions(field, responseData));
            } catch (error) {
                this.setState({ loading: false, error: true });
            }
        }
    }

    componentDidMount() {
        const { settings, parentField } = this.props;

        !parentField && this.getDictionary(settings.dictionary, settings.parent);
    }

    componentDidUpdate() {
        const {
            settings,
            settings: {
                parentType
            },
            parentField,
            parentFieldValue,
            contextOptions,
            field,
            fieldsWithoutValidation,
            changeFieldValidation,
            required,
            toggleRequired
        } = this.props;
        const { loading } = this.state;
        const isDictionaryLink = parentType === 'parent';

        if (parentField && !loading) {
            const dictionaryId = prop('dictionary', settings);
            const options = parentFieldValue ? path(['options', parentFieldValue], this.state) : path(['options', dictionaryId], this.state);
            const parentFieldOptions = prop(parentField, contextOptions);

            if (parentFieldValue) {
                !options && this.getDictionary(dictionaryId, parentFieldValue);
            } else {
                !options && isEmpty(parentFieldOptions) && this.getDictionary(dictionaryId);
            }

            if (options && fieldsWithoutValidation[field] !== isEmpty(options)) {
                changeFieldValidation(field, isEmpty(options));
            }

            const newRequiredStatus = !isEmpty(options);

            if (newRequiredStatus !== required) {
                toggleRequired(newRequiredStatus);
            }
        }

        if (isDictionaryLink) {
            const { settings: { parent } } = this.props;
            const options = path(['options', parent], this.state);
            const newRequiredStatus = !isEmpty(options);

            if (options && fieldsWithoutValidation[field] !== isEmpty(options)) {
                if (newRequiredStatus !== required) {
                    toggleRequired(newRequiredStatus);
                }

                changeFieldValidation(field, isEmpty(options));
            }
        }
    }

    onChange = (data) => {
        const { settings, onChange, field, form: { batch, change }, changeContextOptions, input: { value } } = this.props;
        const multiple = path(['multiple'], settings);

        if (data) {
            if (multiple) {
                onChange(data && data.length ? data.map(({ id }) => id) : undefined);
            } else {
                onChange(path(['id'], data) || undefined);
            }
        }

        if (!data || (!!value && (value !== data.id))) {
            const childs = this.getFieldChilds();
            const fieldsForCleaning = !data ? [field, ...childs] : childs;
            const { mutators: { mutateValue } } = this.props.form;

            batch(() => {
                fieldsForCleaning.forEach(fieldName => {
                    change(fieldName, undefined);
                });
            });

            fieldsForCleaning.forEach(fieldName => {
                changeContextOptions(fieldName, undefined);
            });
        }
    }

    getOptions = () => {
        const { parentField, parentFieldValue, contextOptions } = this.props;
        const parentFieldOptions = prop(parentField, contextOptions);

        if (parentField && !isEmpty(parentFieldOptions)) {
            return pathOr([], ['options', parentFieldValue], this.state);
        } else {
            const { settings } = this.props;
            const dictionaryKey = settings.parent || settings.dictionary;

            return pathOr([], ['options', dictionaryKey], this.state);
        }
    }

    getParentOptions = () => {
        const { contextOptions, parentField } = this.props;

        return prop(parentField, contextOptions);
    }

    getDisableStatus = () => {
        const parentOptions = this.getParentOptions();

        if (this.props.parentField) {
            return (parentOptions && isEmpty(parentOptions)) ? false : !this.props.parentFieldValue;
        } else {
            return false;
        }
    }

    getFieldChilds = () => {
        const { fields, field } = this.props;
        const childs = [];
        let currentFields = [field];
        const findChilds = (fieldName) => filter(pathEq(['settings', 'parentField'], fieldName), fields);

        while (!isEmpty(currentFields)) {
            currentFields.forEach(fieldName => {
                const childsFields = findChilds(fieldName);

                if (!isEmpty(childsFields)) {
                    childsFields.forEach(({ field }) => {
                        childs.push(field);
                        currentFields.push(field);
                        currentFields = filter((currentFieldName) => currentFieldName !== fieldName, currentFields);
                    });
                } else {
                    currentFields = [];
                }
            });
        }

        return childs;
    }

    getDropdownIndicator = (props) => {
        const { error } = this.state;
        const { getStyles } = props;

        return error ? (
            <div style={getStyles('dropdownIndicator', props)}>
                <div
                    className='error-indicator'
                    onClick={() =>  this.getDictionary(this.props.settings.dictionary, this.props.settings.parent)}
                >
                    <div className='error-icon'>!</div>
                </div>
            </div>
        ) : (
            <components.DropdownIndicator {...props} />
        );
    }

    render() {
        const { input: { value }, settings, t, disabled } = this.props;
        const multiple = path(['multiple'], settings);
        const options = this.getOptions();

        return (
            <div>
                <ReactSelect
                    key={value}
                    value={multiple ? filter(item => contains(item.id, value || []), options) : find(propEq('id', value), options)}
                    options={options}
                    onChange={this.onChange}
                    isMulti={multiple}
                    isSearchable={options.length > 10}
                    noOptionsMessage={() => t('noOptionsMessage')}
                    placeholder={null}
                    classNamePrefix='jobot-forms'
                    isDisabled={disabled || this.getDisableStatus()}
                    getOptionLabel={(option) => option ? option.value : undefined}
                    getOptionValue={(option) => option.id}
                    isLoading={this.state.loading}
                    components={{
                        DropdownIndicator: this.getDropdownIndicator
                    }}
                    openMenuOnClick={!this.state.error}
                    isClearable
                />
            </div>
        );
    }
}

const withParentField = WrappedComponent =>
    class WithParentField extends Component {
        render() {
            const { settings } = this.props;
            const parentField = prop('parentField', settings);

            return (
                <CompanyDictionaryContext.Consumer>
                    { ({ options, changeOptions }) => {
                        const renderComponent = value => (
                            <WrappedComponent
                                parentField={parentField}
                                parentFieldValue={value}
                                contextOptions={options}
                                changeContextOptions={changeOptions}
                                {...this.props}
                            />
                        );

                        return parentField ? (
                            <Field name={parentField} subscription={{ value: true }}>
                                {({ input: { value } }) => renderComponent(value)}
                            </Field>
                        ) : renderComponent();
                    }}
                </CompanyDictionaryContext.Consumer>
            );
        }
    };

export default withFieldWrapper(withParentField(withTranslation()(Select)));
