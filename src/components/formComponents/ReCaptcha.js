import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import withFieldWrapper from '../hocs/withFieldWrapper';

class ReCaptcha extends Component {
    render() {
        const { input: { onChange }} = this.props;

        return <ReCAPTCHA
            sitekey={process.env.RECAPTCHA}
            onChange={onChange}
            style={{ marginBottom: 15 }}
        />;
    }
}

export default withFieldWrapper(ReCaptcha);
