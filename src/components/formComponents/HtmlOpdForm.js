import React, { Component } from 'react';
import { all, forEach, is } from 'ramda';
import cx from 'classnames';
import { FormSpy } from 'react-final-form';

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
    .opd-html-form label {
        pointer-events: auto;
    }
    .opd-html-form input:focus {
        outline: none;
    }
    .opd-html-form.submitted input:invalid {
        border-bottom: 1px solid red;
    }
    .opd-html-form input[type="checkbox"] {
        position: relative;
        margin-right: 10px;
    }
    .opd-html-form input[type="checkbox"]:required::after {
        content: "*";
        color: red;
        top: -6px;
        right: -8px;
        position: absolute;
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
                .opd-html-form input,
                .opd-html-form label {
                    pointer-events: none;
                }
                .opd-html-form input[type="checkbox"]:required::after {
                    content: "";
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

    onSubmit = ({ form }) => {
        const inputs = this.form.querySelectorAll('input');
        const valid = all(input => input.validity.valid, inputs);

        this.setState({ submitted: true });

        if (valid) {
            const values = {};

            forEach(input => {
                if (input.type === 'checkbox') {
                    if (input.checked) {
                        input.setAttribute('checked', input.checked);
                    }
                } else {
                    input.setAttribute('value', input.value);
                }

                const separateField = input.getAttribute('data-separate-field');

                if (separateField) {
                    const value = input.type === 'checkbox' ? input.checked : input.value;
                    values[separateField] = value;
                    form.change(separateField, value);
                }
            }, inputs);

            this.props.onSubmit(getHtml(this.form.innerHTML), values);
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
            <FormSpy>
                { formProps => <button className={styles.formBtn} type='button' onClick={() => this.onSubmit(formProps)}>Согласен</button> }
            </FormSpy>
        </div>;
    }
}

export default HtmlOpdForm;
