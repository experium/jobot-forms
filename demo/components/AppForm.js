import React, { Component, useState } from 'react';
import { graphql, Mutation } from 'react-apollo';
import { compose, pathOr, find, propEq, path, has } from 'ramda';
import ReactSelect from 'rc-select';
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

const htmlOpdText2 =
    `<div>
        <style>
            .name, .email {
                width: 400px;
            }
        </style>
        <strong>
            <div style="text-align: center;">СОГЛАСИЕ КАНДИДАТА</div>
            <div style="text-align: center;">на обработку персоных данных</div>
        </strong>
        <p>Я, <input class='name text' name="name" type="text" placeholder="ФИО" required />, гражданин <input class='text' name="country" type="text" placeholder="страна" required />, личный емейл <input class='text email' name="email" type="email" placeholder="личный email" required /> (далее «Кандидат»), даю согласие <strong>Обществу с ограниченной ответственностью «АКСЕНЧЕР»</strong>, ИНН 7705476338 ОГРН 1027705028405, находящемуся по адресу РФ, 115054, г. Москва, Павелецкая площадь д. 2, строение 2 (далее «<strong>Компания</strong>»), на обработку моих персональных данных, указанных в таблице ниже, в соответствии с Федеральным законом от 27.07.2006 N 152-ФЗ «О персональных данных» и иного применимого законодательства.</p>
        <table style="border-collapse: collapse; border: 1px solid black;">
            <tr style="border: 1px solid black;">
                <th style="padding: 5px;">Перечень обрабатываемых персональных данных</th>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Фамилия, имя, отчество</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Реквизиты документа, удостоверяющего личность (для кандидатов, в отношении которых будет проведена проверка и/или дальнейшее трудоустройство)</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Пол</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Гражданство</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Место регистрации и фактического проживания</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Номера телефонов (мобильный, домашний)</td>
            </tr>
            <tr style="border: 1px solid black;">
                <td style="padding: 5px;">Адрес электронной почты</td>
            </tr>
        </table>
        <p>Для вышеуказанных целей разрешаю осуществлять следующие действия как автоматизированным, так и неавтоматизированным способом: сбор, запись, хранение, систематизация, накопление, уточнение (обновление, изменение), использования, копирование, обезличивание, комбинирование, блокирование, уничтожение и иные способы обработки, а также осуществлять трансграничную передачу аффилированным лицам Компании (список и адреса компаний доступны по ссылке <a href="https://www.sec.gov/Archives/edgar/data/1467373/000146737318000318/acn831201810-kexhibit211.htm" target="_blank">https://www.sec.gov/Archives/edgar/data/1467373/000146737318000318/acn831201810-kexhibit211.htm</a>), а также передачу в организацию, осуществляющую обработку персональных данных по поручению Компании: ООО «Аксор» (191186, г. Санкт-Петербург, проспект Невский, д. 10 литера. А) для подготовки и оформления трудового договора с Кандидатом и проверки достоверности предоставленных данных.</p>
        <p>Срок обработки персональных данных Кандидатов, включенных в кадровый резерв, составляет 6 лет. Настоящее согласие может быть отозвано путем подачи письменного заявления.</p>
        <p>Условия обработки Компанией персональных данных и иные применимые положения закреплены в Положении Компании о персональных данных (электронная версия доступна по ссылке <a href="https://www.accenture.com/_acnmedia/Accenture/ru-ru/PDF/Position_of_personal_data.pdf" target="_blank">https://www.accenture.com/_acnmedia/Accenture/ru-ru/PDF/Position_of_personal_data.pdf</a>) и Положении Компании о кадровом резерве (электронная версия доступна по ссылке <a href="https://www.accenture.com/_acnmedia/Accenture/Redesign-Assets/DotCom/Documents/Local/1/Accenture-Terms-of-Personnel-Reserve.pdf" target="_blank">https://www.accenture.com/_acnmedia/Accenture/Redesign-Assets/DotCom/Documents/Local/1/Accenture-Terms-of-Personnel-Reserve.pdf</a>).</p>
        <p><label><input name="opdPurpose" type="checkbox" data-separate-field="opdPurpose" required />я выражаю согласие на обработку персональных данных для цели рассмотрения вопроса о моем трудоустройстве в Компании и включения в кадровый резерв Компании</label></p>
        <p><label><input name="opdAccept" type="checkbox" data-separate-field="opdAccept" required />я выражаю согласие на передачу моих персональных данных в организацию, осуществляющую обработку персональных данных по поручению Компании: ООО «Аксор» (191186, г. Санкт-Петербург, проспект Невский, д. 10 литера. А) для подготовки и оформления трудового договора с Кандидатом и проверки достоверности предоставленных данных</label></p>
        <p><label><input name="transmission" type="checkbox" data-separate-field="transmission" required />я выражаю согласие на трансграничную передачу моих персональных данных в другие компании группы Аксенчер</label></p>
        <p><label><input name="mailing" type="checkbox" data-separate-field="mailing" />я выражаю согласие на получение рассылки материалов рекламного и/или информационного характера посредством SMS-сервисов, Viber, WhatsApp, Telegram, Skype и других месcенджеров, электронной почты и т.д.</label></p>
    </div>`;

const getOpdValues = ({ values }) => {
    return {
        name: `${values.firstName || ''} ${values.lastName || ''}`,
        email: values.email,
    };
};

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
                <div className='pda-modal-text' dangerouslySetInnerHTML={{ __html: props.opd }} />
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
    constructor(props) {
        super(props);

        this.state = {
            error: false,
            language: localStorage.getItem('formLanguage') || 'en',
        };

        this.formRef = React.createRef();
    }

    onCompleted = () => {
        this.state.error && this.setState({ error: false });
        this.props.history.push('/form/success');
    };

    onError = () => this.setState({ error: true });

    render() {
        const { data, match, history: { location: { search }}} = this.props;
        const vacancy = pathOr({}, ['vacancy'], data);
        const companyCaptcha = path(['company', 'companySettings', 'captcha', 'landings'], vacancy);
        const companyPda = path(['company', 'companySettings', 'pda'], vacancy);
        const searchPath = qs.parse(search, { ignoreQueryPrefix: true });
        const components = has('custom', searchPath) ? customComponents : {};
        const htmlOpd = has('htmlOpd', searchPath) ? htmlOpdText2 : null;
        const allowFileExtensions = path(['company', 'companySettings', 'allowFileExtensions'], vacancy);
        const captchaSettings = path(['formPreset', 'options'], vacancy);

        return data.loading ? <div>Загрузка...</div> :
            data.error ? <div>Не удалось загрузить вакансию</div> :
                <div style={{ width: 'auto', maxWidth: 1000, padding: 15, margin: 'auto' }}>
                    <div className='form-header'>
                        <h1 className='vacancy-title'>{ vacancy.title }</h1>
                        <div className='language-select'>
                            <ReactSelect
                                prefixCls='jobot-forms-rc-select'
                                onChange={value => {
                                    this.setState({ language: value });
                                    localStorage.setItem('formLanguage', value);
                                }}
                                options={LANGUAGES_OPTIONS}
                                value={this.state.language}
                            />
                        </div>
                    </div>
                    <Mutation
                        mutation={createApplicant}
                        onCompleted={this.onCompleted}
                        onError={this.onError}>
                        { (mutation, { error }) =>
                            <Form
                                formRef={this.formRef}
                                apiUrl={API_URL}
                                fields={compose(
                                    // placeholder
                                    // assocPath([0, 'settings', 'placeholder'], 'placeholder'),
                                    // mask text field
                                    // assocPath([0, 'settings', 'mask'], '9999'),
                                    // tree
                                    // assocPath([1, 'settings', 'tree'], true),
                                    // assocPath([1, 'settings', 'placeholder'], 'placeholder'),
                                    // assocPath([1, 'settings', 'parents'], {
                                    //     [path(['questions', 0, 'field'], vacancy)]: path(['questions', 0, 'settings', 'dictionary'], vacancy),
                                    // }),
                                    // link
                                    // assocPath([1, 'settings', 'linkField'], path(['questions', 0, 'field'], vacancy)),
                                    // assocPath([1, 'settings', 'linkType'], 'hide'),
                                    // assocPath([1, 'settings', 'linkValue'], '1'),
                                    // phone
                                    // assocPath([6, 'settings', 'international'], true),
                                    pathOr([], ['questions']),
                                )(vacancy)}
                                onSubmit={form => {
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
                                getOpdValues={htmlOpd ? getOpdValues : undefined}
                                serverErrors={error}
                                allowFileExtensions={allowFileExtensions}
                                initialValues={{
                                    country: '605da91ef0c62a0058b1d280',
                                    citizenship: [
                                        '605da91ef0c62a0058b1d280',
                                        '605da91ef0c62a0058b1d281'
                                    ]
                                }}
                                translations={{
                                    en: {
                                        translation: {
                                            'send': 'OK',
                                            'errors.required': 'Required',
                                        }
                                    },
                                    ru: {
                                        translation: {
                                            'send': 'OK',
                                            'errors.required': 'Введите значение',
                                        }
                                    }
                                }}
                                htmlAttrs={{
                                    submit: {
                                        'data-analytics-link-name': 'submit'
                                    },
                                    opdCheckbox: {
                                        'data-analytics-link-name': 'i accept the data privacy policy',
                                        'data-analytics-content-type': 'cta',
                                        'data-analytics-template-zone': 'body',
                                        'data-analytics-module-name': 'application submission',
                                    },
                                }}
                                excludeDictionary={{
                                    'PplEduLevel': [6]
                                }}
                                renameDictionary={{
                                    'PplEduLevel': {
                                        3: 'Высшее (специалитет)'
                                    }
                                }}
                                captcha={companyCaptcha}
                                captchaSettings={captchaSettings}
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
