import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import withFieldWrapper from '../hocs/withFieldWrapper';

class ReCaptcha extends Component {
    render() {
        const { input: { onChange }, language } = this.props;

        return process.env.RECAPTCHA ? <ReCAPTCHA
            sitekey={process.env.RECAPTCHA}
            onChange={onChange}
            style={{ marginBottom: 15 }}
            hl={language || 'ru'}
        /> : null;
    }
}

export default withFieldWrapper(ReCaptcha);
