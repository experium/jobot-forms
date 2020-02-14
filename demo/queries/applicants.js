import gql from 'graphql-tag';

export const createApplicant = gql(`
    mutation createApplicant($vacancy: String!, $form: JSON) {
        createApplicant(vacancy: $vacancy, form: $form) {
            id
        }
    }
`);
