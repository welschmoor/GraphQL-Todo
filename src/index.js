import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ApolloClient, InMemoryCache, gql, ApolloProvider } from '@apollo/client';

// yes, I know, no secret keys on client side
// it's just a test app
const client = new ApolloClient({
  uri: 'https://growing-honeybee-65.hasura.app/v1/graphql',
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret': "Rr3ojotT5cA40xZvMM5u818cA2ZQqH27X6GXUve4EjSBZSEWuoapxE7aT9SFKyRS"
  }
})

client.query({
  query: gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }`
}).then(res => console.log("response: ", res))



ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

