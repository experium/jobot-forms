import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import withFieldWrapper from '../hocs/withFieldWrapper';

class ReCaptcha extends Component {
    render() {
        const { input: { onChange }, language } = this.props;
        const sitekey = process.env.RECAPTCHA || process.env.REACT_APP_RECAPTCHA;

        return sitekey ? <ReCAPTCHA
            sitekey={sitekey}
            onChange={onChange}
            style={{ marginBottom: 15 }}
            hl={language || 'ru'}
        /> : null;
    }
}

export default withFieldWrapper(ReCaptcha);
