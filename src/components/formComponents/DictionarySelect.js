import React, { Component } from 'react';
import { allPass, path, contains, find, propEq, filter, prop, propOr, pathOr, isEmpty, pathEq } from 'ramda';
import { Field } from 'react-final-form';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import { CompanyDictionaryContext } from '../../context/CompanyDictionary';
import withFieldWrapper from '../hocs/withFieldWrapper';
import FormSelect from './FormSelect';
import { sorterByLabel } from './Select';

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

                if (!response.ok) {
                    throw new Error();
                }

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

    onChange = (value) => {
        const { settings, onChange, field, form: { batch, change }, changeContextOptions, input } = this.props;
        const multiple = path(['multiple'], settings);

        if (value) {
            if (multiple) {
                onChange(value && value.length ? value : undefined);
            } else {
                onChange(value || undefined);
            }
        }

        if (!value || (!!value && (value !== input.value))) {
            const childs = this.getFieldChilds();
            const fieldsForCleaning = !value ? [field, ...childs] : childs;
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
        const { settings, parentField, parentFieldValue, contextOptions } = this.props;
        const parentFieldOptions = prop(parentField, contextOptions);
        const dictionaryKey = settings.parent || settings.dictionary;

        const options = parentField && !isEmpty(parentFieldOptions) ?
            pathOr([], ['options', parentFieldValue], this.state)
            : pathOr([], ['options', dictionaryKey], this.state);

        return filter(allPass([
            item => {
                if (settings.selection) {
                    return contains(item.id, settings.selection);
                } else {
                    return true;
                }
            },
        ]), options);
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

    render() {
        const { input: { value, name }, settings, t, disabled, useNative } = this.props;
        const multiple = path(['multiple'], settings);
        const placeholder = path(['placeholder'], settings) || null;
        const options = this.getOptions();

        return (
            <div>
                <FormSelect
                    id={name}
                    key={value}
                    value={value || undefined}
                    options={options}
                    onChange={this.onChange}
                    mode={multiple ? 'multiple' : 'single'}
                    showSearch={options.length > 10}
                    filterSort={sorterByLabel}
                    optionFilterProp='label'
                    notFoundContent={t('noOptionsMessage')}
                    placeholder={placeholder}
                    prefixCls='jobot-forms-rc-select'
                    disabled={disabled || this.getDisableStatus()}
                    loading={this.state.loading}
                    openMenuOnClick={!this.state.error}
                    allowClear
                    virtual
                    {...(this.state.error ? { open: false } : {})}
                    useNative={useNative}
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
