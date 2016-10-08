import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';
import routes from './routes.jsx';
import { AUTH_USER } from './actions/types';

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers, compose(window.devToolsExtension ? window.devToolsExtension() : f => f ));

const token = localStorage.getItem('token');
// If we have a token, consider the user to be signed in

if (token) {
  // we need to update application state
  store.dispatch({ type: AUTH_USER }); //the dispatch method is located on store also
}

//wrapping any of these components with RequireAuth() will check for state.auth.authenticated being true before allowing access to the route
//The Welcome component will render when sitting on the "/" home route
ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
  , document.querySelector('.container'));
