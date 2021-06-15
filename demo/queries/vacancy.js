import gql from 'graphql-tag';

export const getVacancy = gql(`
    query getVacancy($id: String!) {
        vacancy(id: $id) {
            id,
            title,
            pda,
            questions {
                field,
                type,
                label,
                settings,
                required,
                translations
            },
            translations,
            company {
                id,
                companySettings {
                    pda,
                    allowFileExtensions,
                    captcha {
                        landings,
                        domains
                    }
                }
            },
            formPreset {
                options {
                    captchaType,
                    captchaToken,
                    captchaData
                }
            }
        }
    }
`);
