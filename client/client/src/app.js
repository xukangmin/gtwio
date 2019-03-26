import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { store } from './_store/reduxStore.js';

import routes from './_routes/routes';

if (process.env.NODE_ENV !== 'production') {
   console.log('Looks like we are in development mode!');
}

render((
    <Provider store={store}>
        <BrowserRouter>
            {renderRoutes(routes, {store:store})}
        </BrowserRouter>
    </Provider>
), document.getElementById('reactBody'));
