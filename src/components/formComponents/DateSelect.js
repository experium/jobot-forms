import React, { Component } from 'react';
import Masked from 'react-text-mask';
import { contains, path, isNil, find, propEq } from 'ramda';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import withFieldWrapper from '../hocs/withFieldWrapper';
import { YEAR_MASK, DAY_MASK } from '../../constants/masks';
import styles from '../../styles/index.module.css';
import FormSelect from './FormSelect';

class DateSelect extends Component {
    constructor(props) {
        super(props);

        let day = undefined;
        let month = undefined;
        let year = undefined;

        const { settings: { format }, input: { value }} = props;

        if (value) {
            if (format === 'dd.MM.y') {
                const date = moment(value, 'DD.MM.YYYY');

                day = date.date();
                month = date.month() + 1;
                year = date.year();
            } else if (format === 'MM.y') {
                const date = moment(value, 'MM.YYYY');

                month = date.month() + 1;
                year = date.year();
            } else if (format === 'y') {
                const date = moment(value, 'YYYY');

                year = date.year();
            }
        }

        this.state = {
            day,
            month,
            year
        };
    }

    componentDidUpdate(prev) {
        if (!this.props.input.value && prev.input.value) {
            this.setState({ day: '', month: null, year: '' });
        }
    }

    onChange = (day, month, year) => {
        const format = path(['settings', 'format'], this.props);

        if (format) {
            if (format === 'dd.MM.y') {
                this.props.onChange(
                    day && !isNil(month) && year ? (
                        moment().year(year).month(month - 1).date(day)
                            .format('DD.MM.YYYY')
                    ) : (day || !isNil(month) || year) ? 'incomplete' : undefined
                );
            } else if (format === 'MM.y') {
                this.props.onChange(
                    year && !isNil(month) ? (
                        moment().year(year).month(month - 1).format('MM.YYYY')
                    ) : (year || !isNil(month)) ? 'incomplete' : undefined);
            } else if (format === 'y') {
                this.props.onChange(year ? (
                    moment().year(year).format('YYYY')
                ) : undefined);
            }
        } else {
            this.props.onChange(
                day && !isNil(month) && year ?
                    moment().year(year).month(month - 1).date(day)
                        .format('YYYYMMDD') :
                    (day || !isNil(month) || year) ? 'incomplete' : undefined
            );
        }
    }

    onChangeDay = e => {
        const { month, year } = this.state;
        const day = e.target.value;

        this.setState({ day });
        this.onChange(day, month, year);
    }

    onChangeMonth = month => {
        const { day: current, year } = this.state;
        const day = month && !year && moment().month(month - 1).daysInMonth() < current ? moment().month(month - 1).daysInMonth() :
            month && year && moment().month(month - 1).year(year).daysInMonth() < current ? moment().month(month - 1).year(year).daysInMonth() :
                current;

        this.setState({ month, day });
        this.onChange(day, month, year);
    }

    onChangeYear = e => {
        const { day, month } = this.state;
        const year = e.target.value;

        this.setState({ year });
        this.onChange(day, month, year);
    }

    onBlurDay = () => {
        const { day: current, month, year } = this.state;
        const day = !month && current > 31 ? 31 :
            month && !year && moment().month(month - 1).daysInMonth() < current ? moment().month(month - 1).daysInMonth() :
                month && year && moment().month(month - 1).year(year).daysInMonth() < current ? moment().month(month - 1).year(year).daysInMonth() :
                    current;

        this.setState({ day });
        this.onChange(day, month, year);
    }

    onBlurYear = () => {
        const { day: current, month, year } = this.state;

        if (month && year) {
            const daysInMonth = moment().month(month).year(year).daysInMonth();

            if (daysInMonth < current) {
                this.setState({ day: daysInMonth });
                this.onChange(daysInMonth, month, year);
            }
        }
    }

    render() {
        const { settings, t, disabled, input: { name }, useNative } = this.props;
        const format = path(['format'], settings);
        const showDay = format ? contains('dd', format) : true;
        const showMonth = format ? contains('MM', format) : true;
        const showYear = format ? contains('y', format) : true;
        const { day, month, year } = this.state;
        const options = t('MONTHS', { returnObjects: true });

        return <div id={name} className={`jobot-forms__formDateSelect ${styles.formDateSelect}`}>
            { showDay &&
                <Masked
                    id={`${name}-day`}
                    className={styles.formInput}
                    value={day}
                    onChange={this.onChangeDay}
                    onBlur={this.onBlurDay}
                    mask={DAY_MASK}
                    placeholderChar={'\u2000'}
                    placeholder={t('placeholders.datePicker.day')}
                    keepCharPositions={false}
                    disabled={disabled}
                    guide />
            }
            { showMonth &&
                <FormSelect
                    id={`${name}-month`}
                    disabled={disabled}
                    value={month || undefined}
                    onChange={this.onChangeMonth}
                    options={options}
                    placeholder={t('placeholders.datePicker.month')}
                    prefixCls='jobot-forms-rc-select'
                    className='jobot-forms-month-select'
                    useNative={useNative}
                />
            }
            { showYear &&
                <Masked
                    id={`${name}-year`}
                    disabled={disabled}
                    className={styles.formInput}
                    value={year}
                    onChange={this.onChangeYear}
                    onBlur={this.onBlurYear}
                    mask={YEAR_MASK}
                    placeholderChar={'\u2000'}
                    placeholder={t('placeholders.datePicker.year')}
                    keepCharPositions={false}
                    guide />
            }
        </div>;
    }
}

export default withFieldWrapper(withTranslation()(DateSelect));
