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

const htmlOpdText =
    `<div>
        <div style="text-align: center;"><strong>Письменная форма согласия соискателя вакансии на обработку персональных данных</strong></div>
        <p>Я, <input name="name" type="text" placeholder="ФИО" style="width: 400px;" required />, дата рождения <input name="birthDate" type="text" placeholder="Число, месяц, год" required /> в соответствии с Федеральным законом РФ от 27.07.2006 № 152-ФЗ «О персональных данных» даю согласие ЗАО «П.Р.Русь», расположенному по адресу: 119034, Москва, Сеченовский пер., д. 7, на обработку моих персональных данных, а именно:</p>
        <ul>
            <li>ФИО;</li>
            <li>мобильный телефон;</li>
            <li>адрес электронной почты;</li>
            <li>данные об образовании;</li>
            <li>данные о прошлых и текущем местах работы;</li>
            <li>город проживания;</li>
            <li>оклад и иные виды компенсации;</li>
            <li>иные ПДн, которые соискатель может включить в резюме.</li>
        </ul>
        <p>Целью обработки персональных данных является поиск и подбор персонала на вакантные должности в ЗАО «П.Р.Русь».</p>
        <p>Настоящее согласие предоставляется на совершение любых действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств, с моими персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу, обезличивание, блокирование, удаление, уничтожение персональных данных.</p>
        <p>Я подтверждаю, что ознакомлен с требованиями законодательства Российской Федерации, устанавливающими порядок обработки персональных данных, с документом «Политика ЗАО «П.Р.Русь» в отношении обработки персональных данных», а также с моими правами и обязанностями в этой области.</p>
        <p>Согласие вступает в силу в день его подписания и действует в течение семи календарных лет. Согласие может быть отозвано мною в любое время на основании моего письменного заявления.</p>
    </div>`;

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
        const searchPath = qs.parse(search, { ignoreQueryPrefix: true });
        const components = has('custom', searchPath) ? customComponents : {};
        const htmlOpd = has('htmlOpd', searchPath) ? htmlOpdText : null;

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
                                htmlOpd={htmlOpd}
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
