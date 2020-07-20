import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { URL } from '../constants/url';
import AppForm from './AppForm';
import Success from './Success';
import VacanciesList from './VacanciesList';

const client = new ApolloClient({
    uri: URL,
});

export default class App extends Component {
    render() {
        return <ApolloProvider client={client}>
            <BrowserRouter basename='/jobot-forms'>
                <Switch>/
                    <Route path='/' exact component={VacanciesList} />
                    <Route path='/form/success' component={Success} />
                    <Route path='/form/:id' component={AppForm} />
                    <Route render={() => 'Страница не найдена'} />
                </Switch>
            </BrowserRouter>
        </ApolloProvider>;
    }
}
