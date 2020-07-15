import React, { Component } from 'react';
import { Field } from 'react-final-form';
import { path } from 'ramda';

class LinkedFieldWrapper extends Component {
    render() {
        const { field, children } = this.props;
        const linkField = path(['settings', 'linkField'], field);
        const linkType = path(['settings', 'linkType'], field);
        const linkValue = path(['settings', 'linkValue'], field);

        return (
            <Field name={linkField}>
                { ({ input: { value } }) => {
                    if (linkType === 'hide') {
                        return value === linkValue ? children({ required: true }) : null;
                    } else {
                        return value !== linkValue ? children({ required: false }) : children({ required: true });
                    }
                }}
            </Field>
        );
    }
}

export default LinkedFieldWrapper;
