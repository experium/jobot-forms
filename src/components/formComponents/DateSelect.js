import React, { Component } from 'react';
import Masked from 'react-text-mask';
import Select from 'react-select';
import { contains, path, isNil, find, propEq } from 'ramda';
import moment from 'moment';

import withFieldWrapper from '../hocs/withFieldWrapper';
import { YEAR_MASK, DAY_MASK } from '../../constants/masks';
import { MONTHS } from '../../constants/dates';
import styles from '../../styles/index.css';

class DateSelect extends Component {
    state = {
        day: undefined,
        month: undefined,
        year: undefined
    };

    onChange = (day, month, year) => {
        const format = path(['settings', 'format'], this.props);

        if (format) {
            if (format === 'dd.MM.y') {
                this.props.onChange(
                    day && !isNil(month) && year ? (
                        moment().year(year).month(month).date(day)
                            .format('DD.MM.YYYY')
                    ) : undefined
                );
            } else if (format === 'MM.y') {
                this.props.onChange(
                    year && !isNil(month) ? (
                        moment().year(year).month(month).format('MM.YYYY')
                    ) : undefined);
            } else if (format === 'y') {
                this.props.onChange(year ? (
                    moment().year(year).format('YYYY')
                ) : undefined);
            }
        } else {
            this.props.onChange(
                day && !isNil(month) && year ?
                    moment().year(year).month(month).date(day)
                        .format('YYYYMMDD') :
                    undefined
            );
        }
    }

    onChangeDay = e => {
        const { month, year } = this.state;
        const day = e.target.value;

        this.setState({ day });
        this.onChange(day, month, year);
    }

    onChangeMonth = value => {
        const { day: current, year } = this.state;
        const month = path(['value'], value);
        const day = month && !year && moment().month(month).daysInMonth() < current ? moment().month(month).daysInMonth() :
            month && year && moment().month(month).year(year).daysInMonth() < current ? moment().month(month).year(year).daysInMonth() :
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
            month && !year && moment().month(month).daysInMonth() < current ? moment().month(month).daysInMonth() :
                month && year && moment().month(month).year(year).daysInMonth() < current ? moment().month(month).year(year).daysInMonth() :
                    current;

        this.setState({ day });
        this.onChange(day, month, year);
    }

    onBlurYear = () => {
        const { day: current, month, year } = this.state;

        if (month && year) {
            const daysInMonth = moment().month(month + 1).year(year).daysInMonth();

            if (daysInMonth < current) {
                this.setState({ day: daysInMonth });
                this.onChange(daysInMonth, month, year);
            }
        }
    }

    render() {
        const { settings } = this.props;
        const format = path(['format'], settings);
        const showDay = format ? contains('dd', format) : true;
        const showMonth = format ? contains('MM', format) : true;
        const showYear = format ? contains('y', format) : true;
        const { day, month, year } = this.state;

        return <div className={styles.formDateSelect}>
            { showDay &&
                <Masked
                    className={styles.formInput}
                    value={day}
                    onChange={this.onChangeDay}
                    onBlur={this.onBlurDay}
                    mask={DAY_MASK}
                    placeholderChar={'\u2000'}
                    keepCharPositions={false}
                    guide />
            }
            { showMonth &&
                <Select
                    value={find(propEq('value', month), MONTHS)}
                    onChange={this.onChangeMonth}
                    options={MONTHS}
                    placeholder='Месяц'
                    classNamePrefix='jobot-forms'
                    styles={{
                        container: s => ({ ...s, width: 150, marginRight: 10 })
                    }}
                />
            }
            { showYear &&
                <Masked
                    className={styles.formInput}
                    value={year}
                    onChange={this.onChangeYear}
                    onBlur={this.onBlurYear}
                    mask={YEAR_MASK}
                    placeholderChar={'\u2000'}
                    keepCharPositions={false}
                    guide />
            }
        </div>;
    }
}

export default withFieldWrapper(DateSelect);
