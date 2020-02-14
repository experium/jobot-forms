import React, { Component } from 'react';
import { graphql, Mutation } from 'react-apollo';
import { pathOr } from 'ramda';

import Form from '../../src/index';
import { getVacancy } from '../queries/vacancy';
import { createApplicant } from '../queries/applicants';

class AppForm extends Component {
    state = {
        error: false
    };

    onCompleted = () => this.props.history.push('/form/success');

    onError = () => this.setState({ error: true });

    render() {
        const { data, match } = this.props;
        const vacancy = pathOr({}, ['vacancy'], data);

        return data.loading ? <div>Загрузка...</div> :
            data.error ? <div>Не удалось загрузить вакансию</div> :
                <div style={{ width: 'auto', maxWidth: 1000, padding: 15, margin: 'auto' }}>
                    <h1>{ vacancy.title }</h1>
                    <Mutation
                        mutation={createApplicant}
                        onCompleted={this.onCompleted}
                        onError={this.onError}>
                        { mutation =>
                            <Form
                                fields={vacancy.questions || []}
                                onSubmit={form => {
                                    this.state.error && this.setState({ error: false });
                                    mutation({
                                        variables: {
                                            form, vacancy: match.params.id
                                        }
                                    });
                                }}
                                opd={vacancy.pda}
                                postFileUrl='/file'
                                getFileUrl={id => `/file/${id}`}
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
