import React, { Component, useState } from 'react';
import { graphql, Mutation } from 'react-apollo';
import { pathOr, find, propEq, path, has } from 'ramda';
import ReactSelect from 'react-select';
import qs from 'qs';
import Modal from 'react-responsive-modal';

import Form from '../../src/index';
import { getVacancy } from '../queries/vacancy';
import { createApplicant } from '../queries/applicants';
import { API_URL, GET_FILE, POST_FILE } from '../constants/url';
import { LANGUAGES_OPTIONS } from '../constants/languages';
import styles from '../../src/styles/index.module.css';

const customComponents = {
    personalDataAgreement: props => {
        const [opened, setOpened] = useState(false);

        return <div>
            <button className={styles.formBtn} type='button' onClick={() => setOpened(true)}>Обработка персональных данных</button>
            <Modal
                open={opened}
                onClose={() => setOpened(false)}
                classNames={{
                    modal: 'pda-modal',
                    closeButton: 'pda-modal-close-button',
                }}
                center
            >
                <div dangerouslySetInnerHTML={{ __html: props.opd }} />
                <div style={{ marginTop: 15 }}>
                    <button className={styles.formBtn}
                        style={{ marginRight: 15 }}
                        type='button'
                        onClick={() => {
                            props.onChange(true);
                            setOpened(false);
                        }}>Согласен</button>
                    <button className={styles.formBtn}
                        type='button'
                        onClick={() => {
                            props.onChange(false);
                            setOpened(false);
                        }}>Не согласен</button>
                </div>
            </Modal>
        </div>;
    }
};

class AppForm extends Component {
    state = {
        error: false,
        language: 'ru',
    };

    onCompleted = () => this.props.history.push('/form/success');

    onError = () => this.setState({ error: true });

    render() {
        const { data, match, history: { location: { search }}} = this.props;
        const vacancy = pathOr({}, ['vacancy'], data);
        const companyPda = path(['company', 'companySettings', 'pda'], vacancy);
        const components = has('custom', qs.parse(search, { ignoreQueryPrefix: true })) ? customComponents : {};

        return data.loading ? <div>Загрузка...</div> :
            data.error ? <div>Не удалось загрузить вакансию</div> :
                <div style={{ width: 'auto', maxWidth: 1000, padding: 15, margin: 'auto' }}>
                    <div className='form-header'>
                        <h1 className='vacancy-title'>{ vacancy.title }</h1>
                        <div className='language-select'>
                            <ReactSelect
                                onChange={({ value }) => this.setState({ language: value })}
                                options={LANGUAGES_OPTIONS}
                                value={find(propEq('value', this.state.language), LANGUAGES_OPTIONS)}
                            />
                        </div>
                    </div>
                    <Mutation
                        mutation={createApplicant}
                        onCompleted={this.onCompleted}
                        onError={this.onError}>
                        { mutation =>
                            <Form
                                apiUrl={API_URL}
                                fields={vacancy.questions || []}
                                onSubmit={form => {
                                    this.state.error && this.setState({ error: false });
                                    mutation({
                                        variables: {
                                            form, vacancy: match.params.id
                                        }
                                    });
                                }}
                                opd={vacancy.pda || companyPda}
                                postFileUrl={`${POST_FILE}/${vacancy.id}`}
                                getFileUrl={id => `${GET_FILE}/${id}`}
                                language={this.state.language}
                                components={components}
                            />
                        }
                    </Mutation>
                    { this.state.error && <div style={{ marginTop: 20, color: '#ed0004' }}>Не удалось отправить форму</div> }
                </div>;
    }
}

export default graphql(
    getVacancy,
    {
        options: ({ match }) => ({
            variables: {
                id: match.params.id
            }
        })
    }
)(AppForm);
