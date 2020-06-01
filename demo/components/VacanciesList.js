import React, { Component, Fragment } from 'react';
import { graphql } from 'react-apollo';
import { path, contains, append, without, fromPairs, toPairs } from 'ramda';
import { Link} from 'react-router-dom';
import qs from 'qs';

import { getVacancies } from '../queries/vacancies';

const PARAMS = [
    { key: 'custom', title: 'Кастомное поле ОПД' },
    { key: 'htmlOpd', title: 'HTML-документ в ОПД' }
];

class VacanciesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            params: toPairs(qs.parse(props.location.search, { ignoreQueryPrefix: true })).map(([key]) => key)
        };
    }

    onChangeParam = e => {
        const { checked, value } = e.target;
        const params = checked ? append(value, this.state.params) : without([value], this.state.params);
        const searchPath = qs.stringify(fromPairs(params.map(key => ([key, null]))));

        this.setState({ params });
        this.props.history.replace(`/${searchPath ? `?${searchPath}` : ''}`);
    }

    render() {
        const vacancies = path(['data', 'vacancies', 'items'], this.props);
        const searchPath = qs.stringify(fromPairs(this.state.params.map(key => ([key, null]))));

        return vacancies ? (
            <Fragment>
                <div className='vacancies-params'>
                    { PARAMS.map(({ title, key }) =>
                        <div key={`param-${key}`}>
                            <label htmlFor={`param-${key}`}>
                                <input id={`param-${key}`} value={key} onChange={this.onChangeParam} type='checkbox' checked={contains(key, this.state.params)} />{ title }
                            </label>
                        </div>
                    )}
                </div>
                <div className='vacancies-list'>
                    { vacancies.map(({ title, id }) => (
                        <div className='vacanci-item' key={id}>
                            <div className='vacanci-item-title'>{ title }</div>
                            <div className='vacanci-item-button'>
                                <Link to={`/form/${id}${searchPath ? `?${searchPath}` : ''}`}>Перейти</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </Fragment>
        ) : (
            <div className='vacancy-placeholder' >Список вакансий пуст</div>
        );
    }
}

export default graphql(getVacancies)(VacanciesList);
