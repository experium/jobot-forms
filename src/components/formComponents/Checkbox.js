import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import RcCheckbox from 'rc-checkbox';
import { path, isEmpty, contains, filter, prop } from 'ramda';
import cx from 'classnames';
import { withTranslation } from 'react-i18next';

import 'rc-checkbox/assets/index.css';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';
import HtmlOpdForm from './HtmlOpdForm';

class CheckboxComponent extends Component {
    static propTypes = {
        value: PropTypes.array,
        disabled: PropTypes.bool,
        options: PropTypes.array,
    }

    static defaultProps = {
        value: [],
    }

    componentDidMount() {
        const { settings, getDictionary } = this.props;
        const dictionary = path(['dictionary'], settings);

        if (dictionary) {
            getDictionary(dictionary);
        }
    }

    onChange = ({ target }) => {
        const { input: { value, onChange }, settings, onValueChange, meta: { submitting }} = this.props;
        const multiple = prop('multiple', settings);

        if (submitting) {
            return;
        }

        if (onValueChange) {
            onValueChange(target.checked);
            return;
        }

        if (target.checked) {
            multiple ? onChange([...value, target.value]) : onChange(target.value);
        } else {
            const newValue = filter((value) => value !== target.value, value);

            isEmpty(newValue) ? onChange(undefined) : onChange(newValue);
        }
    }

    render() {
        const { input: { value = [] }, options, disabled, settings, required, fieldType } = this.props;

        return options && !isEmpty(options) ? (
            <div className='checkbox-block'>
                { options.map(({ value: checkboxValue, label }) => {
                    return (
                        <label
                            className={cx('checkbox-wrapper', { 'checkbox-wrapper-required': required || fieldType === 'personalDataAgreement' })}
                            key={label}>
                            <RcCheckbox
                                onChange={this.onChange}
                                className='checkbox'
                                defaultChecked={contains(checkboxValue, value)}
                                checked={prop('multiple', settings) ? contains(checkboxValue, value) : !!value}
                                value={checkboxValue}
                                disabled={disabled}
                            />
                            <div className='checkbox-label'>
                                { label }
                            </div>
                        </label>
                    );
                })}
            </div>
        ) : null;
    }
}

const Checkbox = withFieldWrapper(CheckboxComponent);

class PersonalDataAgreementComponent extends Component {
    state = {
        opened: false,
        openedHtml: false
    };

    open = event => {
        if (this.props.opd) {
            event.preventDefault();
            this.setState({ opened: true });
        }
    }

    close = () => this.setState({ opened: false });

    closeHtml = () => this.setState({ openedHtml: false });

    getLabel = () => {
        const { t } = this.props;

        return <span>
            {t('opdLabel')} <span className={this.props.opd ? styles.formLink : styles.withoutOpd } onClick={this.open}>{t('opdLink')}</span>
            <Modal
                open={this.state.opened}
                onClose={this.close}
                classNames={{
                    modal: 'pda-modal',
                    closeButton: 'pda-modal-close-button',
                }}
            >
                <div dangerouslySetInnerHTML={{ __html: this.props.opd }} />
            </Modal>
        </span>;
    }

    onChange = () => {
        const { meta: { submitting } } = this.props;

        !submitting && this.setState({ openedHtml: true });
    }

    onSubmitHtml = html => {
        this.props.input.onChange(html);
        this.setState({ openedHtml: false });
    }

    render() {
        return <Fragment>
            <Checkbox
                {...this.props}
                onValueChange={this.props.htmlOpd ? this.onChange : null}
                options={[{
                    value: true,
                    label: this.getLabel()
                }]}
            />
            { this.props.htmlOpd &&
                <Modal
                    open={this.state.openedHtml}
                    onClose={this.closeHtml}
                    classNames={{
                        modal: 'pda-modal',
                        closeButton: 'pda-modal-close-button',
                    }}
                    destroyOnClose
                >
                    <HtmlOpdForm
                        onSubmit={this.onSubmitHtml}
                        value={this.props.input.value}
                        html={this.props.htmlOpd} />
                </Modal>
            }
        </Fragment>;
    }
}

export const PersonalDataAgreement = withTranslation()(PersonalDataAgreementComponent);

export class Boolean extends Component {
    render() {
        return (
            <Checkbox
                {...this.props}
                options={[{
                    value: true,
                    label: this.props.label,
                }]}
            />
        );
    }
}

export default Checkbox;
