import React, { Component } from 'react';
import { FormSpy } from 'react-final-form';

export default WrappedComponent =>
    class FormValues extends Component {
        render() {
            return <FormSpy subscription={{ values: true }}>
                { ({ values }) => <WrappedComponent {...this.props} formValues={values} /> }
            </FormSpy>;
        }
    };
