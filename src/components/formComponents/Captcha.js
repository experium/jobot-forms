import { includes } from 'ramda';
import React, { Component, Fragment } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import styles from '../../styles/index.module.css';
import withFieldWrapper from '../hocs/withFieldWrapper';

class ReCaptcha extends Component {
    onChange = e => this.props.input.onChange(e.target.value);

    render() {
        const { input: { onChange, name, value }, language } = this.props;
        const options = this.props.options || {};
        const sitekey = options.captchaToken || process.env.RECAPTCHA || process.env.REACT_APP_RECAPTCHA;

        return sitekey && options.captchaType === 'recaptcha' ? <ReCAPTCHA
            sitekey={sitekey}
            onChange={onChange}
            style={{ marginBottom: 15 }}
            hl={language || 'ru'}
        /> : includes(options.captchaType, ['symbols', 'math']) ?
            <Fragment>
                <div dangerouslySetInnerHTML={{ __html: options.captchaData }} />
                <input
                    id={name}
                    className={`input ${styles.formInput}`}
                    value={value}
                    type='text'
                    onChange={this.onChange}
                    style={{ marginTop: 15, maxWidth: 150, display: 'block' }}
                />
            </Fragment>
            : 'CAPTCH TYPE OPTIONS ERROR';
    }
}

export default withFieldWrapper(ReCaptcha);
