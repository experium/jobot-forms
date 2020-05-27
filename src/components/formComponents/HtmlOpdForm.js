import React, { Component } from 'react';
import { all, forEach, is } from 'ramda';
import cx from 'classnames';

import styles from '../../styles/index.module.css';

const commonStyle = `
    .opd-html-form {
        line-height: 20px;
    }
    .opd-html-form input {
        border: none;
        border-bottom: 1px solid #000;
        font-size: 16px;
        pointer-events: auto;
    }
    .opd-html-form input:focus {
        outline: none;
    }
    .opd-html-form.submitted input:invalid {
        border-bottom: 1px solid red;
    }
`;

const getHtml = body => `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OPD</title>
            <style>
                ${commonStyle}
                .opd-html-form {
                    font-family: Arial;
                    font-size: 16px;
                }
                .opd-html-form input {
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div style="margin: 10px auto; max-width: 1080px;">
                ${body}
            </div>
        </body>
    </html>
`;

class HtmlOpdForm extends Component {
    state = {
        submitted: false,
        value: null
    };

    componentDidMount() {
        const { value } = this.props;

        if (is(String, value) && value) {
            const el = this.valueHtml.querySelector('.opd-html-form');

            this.setState({ value: el ? el.innerHTML : null });
        }
    }

    onSubmit = () => {
        const inputs = this.form.querySelectorAll('input');
        const valid = all(input => input.validity.valid, inputs);

        this.setState({ submitted: true });

        if (valid) {
            forEach(input => {
                input.setAttribute('value', input.value);
            }, inputs);

            this.props.onSubmit(getHtml(this.form.innerHTML));
        }
    }

    render() {
        const html = this.state.value || this.props.html;

        return <div>
            <div ref={node => this.valueHtml = node} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: this.props.value }} />
            <style>{commonStyle}</style>
            <form ref={node => this.form = node}>
                <div className={cx('opd-html-form', { submitted: this.state.submitted })} dangerouslySetInnerHTML={{ __html: html }} />
            </form>
            <button className={styles.formBtn} type='button' onClick={this.onSubmit}>Согласен</button>
        </div>;
    }
}

export default HtmlOpdForm;
