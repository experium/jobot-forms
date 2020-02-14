import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import AppForm from './AppForm';
import Success from './Success';

const client = new ApolloClient({
    uri: 'https://jobot.dev.experium.net/api/graphql'
});

export default class App extends Component {
    render() {
        return <ApolloProvider client={client}>
            <Router>
                <Switch>
                    <Route path='/form/success' component={Success} />
                    <Route path='/form/:id' component={AppForm} />
                    <Route render={() => 'Страница не найдена'} />
                </Switch>
            </Router>
        </ApolloProvider>;
    }
}
