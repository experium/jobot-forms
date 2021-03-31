import React, { Component } from 'react';
import { prop, find, propEq, isEmpty } from 'ramda';
import { Field } from 'react-final-form';
import { withTranslation } from 'react-i18next';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';
import FormSelect from './FormSelect';

const customStyle = {
    control: (provided) => ({
        ...provided,
        minHeight: '36px',
        height: '36px',
    }),
};

class Money extends Component {
    componentDidMount() {
        const { getDictionary } = this.props;
        const urlParams = `?pagination=${encodeURI('{"offset": 0,"limit": 0 }')}`;
        getDictionary('currency', 'items', urlParams, { labelPath: 'code', valuePath: 'id' });
    }

    getOptions = () => {
        const { settings, options = [] } = this.props;

        if (!isEmpty(options)) {
            const currency = prop('currency', settings);
            const availableCurrencies = prop('availableCurrencies', settings);
            const currencyArray = currency ? [currency] : availableCurrencies;

            return currencyArray.map(currencyId => {
                const currencyItem = find(propEq('value', currencyId), options);

                return ({
                    value: currencyItem.label,
                    label: currencyItem.label,
                });
            });
        } else {
            return [];
        }
    }

    getSingleCurrency = () => {
        const { settings, options = [] } = this.props;

        if (!isEmpty(options)) {
            const currency = prop('currency', settings);

            if (currency) {
                const currencyItem = find(propEq('value', currency), options);

                return currencyItem.label;
            } else {
                return undefined;
            }
        }
    }

    onChangeAmount = onChange => event => {
        const value = event.target.value;
        onChange(value ? Number(value) : undefined);
    }

    onChangeCurrency = onChange => value => {
        onChange(value);
    }

    render() {
        const { input: { name }, t, disabled, useNative } = this.props;
        const options = this.getOptions();
        const singleCurrency = this.getSingleCurrency();

        return (
            <div id={`${name}-money`} className={styles.formMoneySelect}>
                <div className={styles.amountField}>
                    <Field name={`${name}.amount`} key={name}>
                        {({ input: { value, onChange } }) => (
                            <input
                                id={name}
                                disabled={disabled}
                                type='number'
                                className={styles.formInput}
                                value={value}
                                onChange={this.onChangeAmount(onChange)}
                                placeholder={null}
                            />
                        )}
                    </Field>
                </div>
                <div className={styles.currencyField}>
                    <Field
                        key={`${name}-${singleCurrency}`}
                        name={`${name}.currency`}
                        initialValue={singleCurrency}
                    >
                        {({ input: { value, onChange } }) => (
                            <FormSelect
                                id={`${name}-currency`}
                                styles={customStyle}
                                disabled={singleCurrency || disabled}
                                value={value || singleCurrency}
                                options={options}
                                onChange={this.onChangeCurrency(onChange)}
                                notFoundContent={t('noOptionsMessage')}
                                placeholder={t('placeholders.salaryCurrency')}
                                prefixCls='jobot-forms-rc-select'
                                useNative={useNative}
                            />
                        )}
                    </Field>
                </div>
            </div>
        );
    }
}

export default withFieldWrapper(withTranslation()(Money));
