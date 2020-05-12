import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import RcCheckbox from 'rc-checkbox';
import { path, isEmpty, contains, filter, prop } from 'ramda';
import 'rc-checkbox/assets/index.css';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';

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
        const { input: { value, onChange }, settings } = this.props;
        const multiple = prop('multiple', settings);

        if (target.checked) {
            multiple ? onChange([...value, target.value]) : onChange(target.value);
        } else {
            const newValue = filter((value) => value !== target.value, value);

            isEmpty(newValue) ? onChange(undefined) : onChange(newValue);
        }
    }

    render() {
        const { input: { value = [] }, options, disabled } = this.props;

        return options && !isEmpty(options) ? (
            <div className='checkbox-block'>
                { options.map(({ value: checkboxValue, label }) => {
                    return (
                        <label className='checkbox-wrapper' key={label}>
                            <RcCheckbox
                                onChange={this.onChange}
                                className='checkbox'
                                defaultChecked={contains(checkboxValue, value)}
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

export class PersonalDataAgreement extends Component {
    state = {
        opened: false
    };

    open = event => {
        if (this.props.opd) {
            event.preventDefault();
            this.setState({ opened: true });
        }
    }

    close = () => this.setState({ opened: false });

    getLabel = () => {
        return <span>
            Я даю согласие на <span className={this.props.opd ? styles.formLink : styles.withoutOpd } onClick={this.open}>обработку персональных данных</span>
            <Modal
                open={this.state.opened}
                onClose={this.close}
                classNames={{
                    modal: 'pda-modal',
                    closeButton: 'pda-modal-close-button',
                }}
                center
            >
                <div dangerouslySetInnerHTML={{ __html: this.props.opd }} />
            </Modal>
        </span>;
    }

    render() {
        return <Checkbox
            {...this.props}
            options={[{
                value: true,
                label: this.getLabel()
            }]}
        />;
    }
}

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
