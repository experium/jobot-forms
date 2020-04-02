import gql from 'graphql-tag';

export const getVacancies = gql(`
    query getVacancies {
        vacancies(filter:{
            companyCode: "heliosoft"
        }) {
            items {
                id,
                title,
            }
        }
    }
`);
