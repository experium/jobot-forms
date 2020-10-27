# Jobot form

## Demo

[https://experium.github.io/jobot-forms/](https://experium.github.io/jobot-forms/)

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
- `initialValues`: form values
- `formRender`: custom form fields array renderer
- `onSubmit`: `onSubmit` handler will be called when form will be submitted
- `apiUrl`: api url
- `postFileUrl`: post file url
- `getFileUrl`: get file url function

- `language`: language state
- `translations`: i18n translation object expand or replace
- `allowFileExtensions`: allow file settings for document types
- `submitting`: loading
- `serverErrors`: errors object
- `opd`: personal data agreement text
- `htmlOpd`: personal data agreement html template
- `getOpdValues`: personal data agreement html template values map
- `opdSubmitDisabled`: disable submit with no opd
- `htmlAttrs`: html attrs for fields

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
