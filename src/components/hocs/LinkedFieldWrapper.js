import React, { Component } from 'react';
import { Field } from 'react-final-form';
import { path } from 'ramda';

class LinkedFieldWatcher extends Component {
    componentDidUpdate(prev) {
        const { value, field, linkType, linkValue } = this.props;

        if (prev.value !== value) {
            const fieldName = path(['field'], field);
            const valueMatch = value === linkValue;
            const needClear = ((linkType === 'hide') && !valueMatch) || ((linkType === 'hide') && valueMatch);

            if (fieldName && needClear) {
                this.props.form.change(fieldName, undefined);
            }
        }
    }

    render() {
        return this.props.children;
    }
}

class LinkedFieldWrapper extends Component {
    render() {
        const { field, form, children } = this.props;
        const linkField = path(['settings', 'linkField'], field);
        const linkType = path(['settings', 'linkType'], field);
        const linkValue = path(['settings', 'linkValue'], field);

        return (
            <Field name={linkField} subscription={{ value: true }}>
                { ({ input: { value } }) => (
                    <LinkedFieldWatcher value={value} field={field} form={form} linkType={linkType} linkValue={linkValue}>
                        {(linkType === 'hide') ? (
                            value === linkValue ? children({ required: true }) : null
                        ) : (linkType === 'show') ? (
                            value !== linkValue ? children({ required: true }) : null
                        ) : (
                            value !== linkValue ? children({ required: false }) : children({ required: true })
                        )}
                    </LinkedFieldWatcher>
                )}
            </Field>
        );
    }
}

export default LinkedFieldWrapper;
