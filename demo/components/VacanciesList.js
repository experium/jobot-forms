import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { path } from 'ramda';
import { Link} from 'react-router-dom';

import { getVacancies } from '../queries/vacancies';

class VacanciesList extends Component {
    render() {
        const vacancies = path(['data', 'vacancies', 'items'], this.props);

        return vacancies ? (
            <div className='vacancies-list'>
                { vacancies.map(({ title, id }) => (
                    <div className='vacanci-item' key={id}>
                        <div className='vacanci-item-title'>{ title }</div>
                        <div className='vacanci-item-button'>
                            <Link to={`/form/${id}`}>Перейти</Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className='vacancy-placeholder' >Список вакансий пуст</div>
        );
    }
}

export default graphql(getVacancies)(VacanciesList);
