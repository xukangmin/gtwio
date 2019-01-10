import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../_reducers/rootReducer.js'

const loggerMiddleware = createLogger();

export const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // for use with redux chrome extension
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);
