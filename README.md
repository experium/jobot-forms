# Jobot form

## Demo

[https://experium.github.io/jobot-forms/form/:vacancyId](https://experium.github.io/jobot-forms/form/)

## `<Form />`

```js
<Form
    fields={fields}
    onSubmit={values => console.log(values)}
    opd='Personal Data Agreement'
    postFileUrl='/file'
    getFileUrl={id => `/file/${id}`}
/>
```

Form components

### Props

- `fields`: form fields array
- `onSubmit`: `onSubmit` handler will be called when form will be submitted
- `opd`: personal data agreement text
- `postFileUrl`: post file url
- `getFileUrl`: get file url function

### Form fields

```js
const fields = [
    {
        'type': 'choice',
        'field': 'k6g4lxj3',
        'required': true,
        'label': 'Choice',
        'settings': {
            'choices': [
                {
                    'id': 'k6g4lzcn',
                    'value': 'Choice 1'
                },
                {
                    'id': 'k6g4m5d9',
                    'value': 'Choice 2'
                },
                {
                    'id': 'k6g4m6qt',
                    'value': 'Choice 3'
                }
            ],
            'multiple': true
        }
    }
];
```

### Form field types

- text
- email
- personalDataAgreement
- dictionary
- phone
- boolean
- choice
- country
- city
- date
- file
