import React, { Component } from 'react';
import { Field } from 'react-final-form';

export default WrappedComponent =>
    class LocationValues extends Component {
        render() {
            return <Field name='country' subscription={{ value: true }}>
                {({ input: { value: country } }) => <Field name='region' subscription={{ value: true }}>
                    { ({ input: { value: region } }) => (
                        <WrappedComponent
                            {...this.props}
                            formValues={{
                                country,
                                region,
                            }}
                        />
                    )}
                </Field>}
            </Field>;
        }
    };
