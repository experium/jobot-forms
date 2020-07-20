import gql from 'graphql-tag';

import { company } from '../constants/url';

export const getVacancies = gql(`
    query getVacancies {
        vacancies(filter: {
            companyCode: "${company}"
        }) {
            items {
                id,
                title,
            }
        }
    }
`);
