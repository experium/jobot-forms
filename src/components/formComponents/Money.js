import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { prop, find, propEq, isEmpty } from 'ramda';
import { Field } from 'react-final-form';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.module.css';

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

                return currencyItem.code;
            } else {
                return undefined;
            }
        }
    }

    onChangeAmount = onChange => event => {
        const value = event.target.value;
        onChange(Number(value));
    }

    onChangeCurrency = onChange => ({ value }) => {
        onChange(value);
    }

    render() {
        const { input: { name } } = this.props;
        const options = this.getOptions();
        const singleCurrency = this.getSingleCurrency();

        return (
            <div>
                <div className={styles.amountField}>
                    <Field name={`${name}.amount`} key={name}>
                        {({ input: { value, onChange } }) => (
                            <input
                                type='number'
                                className={styles.formInput}
                                value={value}
                                onChange={this.onChangeAmount(onChange)}
                            />
                        )}
                    </Field>
                </div>
                <div className={styles.currencyField}>
                    <Field
                        key={name}
                        name={`${name}.currency`}
                        initialValue={ singleCurrency }
                    >
                        {({ input: { value, onChange } }) => (
                            <ReactSelect
                                isDisabled={singleCurrency}
                                inputValue={singleCurrency}
                                value={find(propEq('code', value), options)}
                                options={options}
                                onChange={this.onChangeCurrency(onChange)}
                                noOptionsMessage={() => 'Нет данных'}
                                placeholder='Выберите значение...'
                            />
                        )}
                    </Field>
                </div>
            </div>
        );
    }
}

export default withFieldWrapper(Money);
