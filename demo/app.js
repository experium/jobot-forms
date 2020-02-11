import React from 'react';
import ReactDOM from 'react-dom';

import Form from '../src/index';

const fields = [
    {
        'type': 'file',
        'field': 'k6hglqdl',
        'question': 'sadasd',
        'required': false,
        'label': 'asdasd',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': null,
            'multiple': false,
            'type': 'audio'
        },
        'translations': null
    },
    {
        'type': 'boolean',
        'field': 'k6g345mw',
        'question': 'вопрос',
        'required': true,
        'label': 'название',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': [
                'ывыв',
                'ывфывфыв',
                'фывфывыфв'
            ],
            'rangeErrorMessage': 'не подходит'
        }
    },
    {
        'type': 'text',
        'field': 'lastName',
        'question': 'Укажите вашу фамилию',
        'required': true,
        'label': 'Фамилия',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'email',
        'field': 'email',
        'question': 'Укажите свой email',
        'required': true,
        'label': 'Email',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'personalDataAgreement',
        'field': 'personalDataAgreement',
        'question': 'Для продолжения мне нужно получить от вас согласие на обработку ваших персональных данных',
        'required': true,
        'label': 'Согласие на ОПД',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'dictionary',
        'field': 'maritalStatus',
        'question': 'Каково ваше семейное положение?',
        'required': true,
        'label': 'Семейное положение',
        'customizable': false,
        'settings': {
            'dictionary': 'PplMaritalStatus',
            'multiple': false,
            'userValueAllowed': false
        }
    },
    {
        'type': 'phone',
        'field': 'phone',
        'question': 'Укажите свой номер телефона',
        'required': true,
        'label': 'Телефон',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'date',
        'field': 'birthDate',
        'question': 'Укажите дату вашего рождения (дд.мм.гггг)',
        'required': true,
        'label': 'Дата рождения',
        'customizable': false,
        'settings': {
            'format': 'dd.MM.y',
            'errorMessage': 'не удалось распознать дату рождения. Ожидаемый формат: дд.мм.гггг'
        }
    },
    {
        'type': 'city',
        'field': 'city',
        'question': 'Укажите город проживания',
        'required': true,
        'label': 'Город',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'date',
        'field': 'yearGraduation',
        'question': 'Укажите год окончания учебного заведения (гггг)',
        'required': true,
        'label': 'Год окончания',
        'customizable': false,
        'settings': {
            'format': 'y',
            'errorMessage': 'не удалось распознать год. Ожидаемый формат: гггг',
            'minValue': '1950',
            'maxValue': 'now',
            'rangeErrorMessage': 'год должен быть не раньше 1950-го и позднее текущего'
        }
    },
    {
        'type': 'country',
        'field': 'citizenship',
        'question': 'Гражданином какой страны вы являетесь?',
        'required': true,
        'label': 'Гражданство',
        'customizable': false,
        'settings': {}
    },
    {
        'type': 'dictionary',
        'field': 'k6g4l6k8',
        'question': 'asdasdasdsad',
        'required': true,
        'label': 'sadadasd',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': [],
            'multiple': true,
            'userValueAllowed': true,
            'userValueQuestion': 'sadasdasdasdasdasd',
            'dictionary': 'YesNoOtherCombo'
        }
    },
    {
        'type': 'choice',
        'field': 'k6g4lxj3',
        'question': 'asd',
        'required': true,
        'label': 'asdasdasdasdasd',
        'customizable': true,
        'settings': {
            'choices': [
                {
                    'id': 'k6g4lzcn',
                    'value': 'adasd'
                },
                {
                    'id': 'k6g4m5d9',
                    'value': 'sad'
                },
                {
                    'id': 'k6g4m6qt',
                    'value': '1111'
                }
            ],
            'correctValues': null,
            'multiple': true,
            'userValueAllowed': true,
            'userValueQuestion': 'asdasd'
        }
    },
    {
        'type': 'composite',
        'field': 'k6g4lxj13',
        'question': 'asd',
        'required': true,
        'label': 'asdasdasdasdasd',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': null,
            'multiple': true,
            'addBlockQuestion': 'asdsdsadsadsadasd',
            'questions': [
                {
                    'type': 'dictionary',
                    'field': 'k6g5qhwi',
                    'customizable': true,
                    'required': true,
                    'label': 'asdasd',
                    'question': 'asdasdasd',
                    'settings': {
                        'dictionary': 'PplMaritalStatus',
                    }
                }
            ]
        }
    },
    {
        'type': 'city',
        'field': 'k6g8p3q1',
        'question': 'город вопр',
        'required': true,
        'label': 'город',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': null
        }
    },
    {
        'type': 'country',
        'field': 'k6g8pg31',
        'question': 'страна вопр',
        'required': true,
        'label': 'страна',
        'customizable': true,
        'settings': {
            'choices': null,
            'correctValues': null
        }
    },
    {
        'type': 'date',
        'field': 'k6gakamv',
        'question': 'датуля',
        'required': true,
        'label': 'дата',
        'customizable': true,
        'settings': {
            'correctValues': null,
            'choices': null,
            'format': 'y'
        }
    }
];

ReactDOM.render(
    <Form
        fields={fields}
        onSubmit={values => console.log(values)}
        opd='ОПД'
        postFileUrl='/file'
        getFileUrl={id => `/file/${id}`}
    />,
    document.getElementById('root')
);
