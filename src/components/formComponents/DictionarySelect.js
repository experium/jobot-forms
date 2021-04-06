import React, { Component } from 'react';
import { allPass, path, contains, find, propEq, filter, prop, propOr, pathOr, isEmpty, pathEq } from 'ramda';
import { Field } from 'react-final-form';
import qs from 'qs';
import { withTranslation } from 'react-i18next';

import styles from '../../styles/index.module.css';

import { CompanyDictionaryContext } from '../../context/CompanyDictionary';
import withFieldWrapper from '../hocs/withFieldWrapper';
import FormSelect from './FormSelect';
import { sorterByLabel } from './Select';

class Select extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {},
            loading: false,
            error: false,
            other: props.settings.userValueAllowed && !props.settings.multiple && props.input.value === (props.settings.userValueQuestion || 'Другое')
        };
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
                const data = responseData.map(item => ({
                    ...item,
                    value: item.id,
                    label: item.value,
                }));

                this.setState({
                    options: {
                        [dictionaryKey]: data,
                    },
                    loading: false,
                }, () => changeContextOptions && changeContextOptions(field, data));
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
                const userValueQuestion = this.getUserValueQuestion().value;

                onChange(this.allowUserValue() && value === userValueQuestion ? undefined : value);
                this.allowUserValue() && this.setState({ other: value === userValueQuestion });
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

    onChangeOther = e => {
        this.props.onChange(e.target.value ? {
            value: 'Иное',
            userValue: e.target.value,
        } : undefined);
    }

    allowUserValue = () => {
        return this.props.settings.userValueAllowed && !this.props.settings.multiple;
    }

    getUserValueQuestion = () => {
        const value = this.props.settings.userValueQuestion || 'Другое';

        return { label: value, value };
    }

    getOptions = () => {
        const { settings, parentField, parentFieldValue, contextOptions } = this.props;
        const parentFieldOptions = prop(parentField, contextOptions);
        const dictionaryKey = settings.parent || settings.dictionary;

        const options = parentField && !isEmpty(parentFieldOptions) ?
            pathOr([], ['options', parentFieldValue], this.state)
            : pathOr([], ['options', dictionaryKey], this.state);

        const filteredOptions = filter(allPass([
            item => {
                if (settings.selection && settings.selection.length) {
                    return contains(item.value, settings.selection);
                } else {
                    return true;
                }
            },
        ]), options);

        return this.allowUserValue() ? [...filteredOptions, this.getUserValueQuestion()] : filteredOptions;
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
                    value={(this.allowUserValue() && this.state.other ? this.getUserValueQuestion().value : value) || undefined}
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
                    allowClear
                    showArrow
                    virtual
                    {...(this.state.error ? { open: false } : {})}
                    useNative={useNative}
                />
                { this.allowUserValue() && this.state.other &&
                    <input
                        className={`input ${styles.formInput}`}
                        style={{ marginTop: 10 }}
                        value={pathOr('', ['userValue'], value)}
                        onChange={this.onChangeOther} />
                }
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
