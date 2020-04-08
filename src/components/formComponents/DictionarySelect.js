import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { path, contains, find, propEq, filter, prop, propOr, pathOr } from 'ramda';
import { FormSpy } from 'react-final-form';
import qs from 'qs';

import withFieldWrapper from '../hocs/withFieldWrapper';

class Select extends Component {
    state = {
        options: {},
        loading: false,
    }

    getDictionary = async (dictionaryId, parentId) => {
        if (!this.state.loading) {
            const { apiUrl } = this.props;
            this.setState({ loading: true });

            const urlParams = qs.stringify({
                filter: {
                    dictionary: dictionaryId,
                    parent: Array.isArray(parentId) ? undefined : parentId,
                    parents: Array.isArray(parentId) ? parentId : undefined
                },
                relations: ['parent']
            }, { addQueryPrefix: true });

            const response = await fetch(`${apiUrl || ''}/api/company-dictionary-item${urlParams}`);
            const responseData = propOr([], 'items', await response.json());
            const dictionaryKey = parentId || dictionaryId;

            this.setState({
                options: {
                    [dictionaryKey]: responseData,
                },
                loading: false,
            });
        }
    }

    componentDidMount() {
        const { settings, parentField } = this.props;
        !parentField && this.getDictionary(settings.dictionary, settings.parent);
    }

    componentDidUpdate() {
        const { settings, parentField } = this.props;
        const { loading } = this.state;

        if (parentField && !loading) {
            const parentFieldValue = this.getParentFieldValue();

            const dictionaryId = prop('dictionary', settings);
            const options = path(['options', parentFieldValue], this.state);

            !options && parentFieldValue && this.getDictionary(dictionaryId, parentFieldValue);
        }
    }

    onChange = (data) => {
        const { settings, onChange } = this.props;
        const multiple = path(['multiple'], settings);

        if (multiple) {
            onChange(data && data.length ? data.map(({ id }) => id) : undefined);
        } else {
            onChange(data.id || undefined);
        }
    }

    getOptions = () => {
        const { parentField } = this.props;

        if (parentField) {
            return pathOr([], ['options', this.getParentFieldValue()], this.state);
        } else {
            const { settings } = this.props;
            const dictionaryKey = settings.parent || settings.dictionary;

            return pathOr([], ['options', dictionaryKey], this.state);
        }
    }

    getParentFieldValue = () => {
        const { parentField, formValues } = this.props;

        return prop(parentField, formValues);
    }

    getDisableStatus = () => {
        if (this.props.parentField) {
            return !this.getParentFieldValue();
        } else {
            return false;
        }
    }

    render() {
        const { input: { value }, settings } = this.props;
        const multiple = path(['multiple'], settings);
        const options = this.getOptions();

        return (
            <ReactSelect
                value={multiple ? filter(item => contains(item.id, value || []), options) : find(propEq('value', value), options)}
                options={options}
                onChange={this.onChange}
                isMulti={multiple}
                isSearchable={true}
                noOptionsMessage={() => 'Нет данных'}
                placeholder='Выберите значение...'
                classNamePrefix='jobot-forms'
                isDisabled={this.getDisableStatus()}
                getOptionLabel={(option) => option.value}
                getOptionValue={(option) => option.id}
                isLoading={this.state.loading}
            />
        );
    }
}

const withParentField = WrappedComponent =>
    class WithParentField extends Component {
        render() {
            const { settings } = this.props;
            const parentField = prop('parentField', settings);

            return parentField ? (
                <FormSpy>
                    {({ values }) => (
                        <WrappedComponent
                            formValues={values}
                            parentField={parentField}
                            {...this.props}
                        />
                    )}
                </FormSpy>
            ) : <WrappedComponent {...this.props} />;
        }
    };

export default withFieldWrapper(withParentField(Select));
