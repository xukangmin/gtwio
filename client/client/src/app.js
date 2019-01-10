import React from 'react'
import {render} from 'react-dom'
import { Provider } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { store } from './_store/reduxStore.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'jquery'
import 'bootstrap'
import 'toastr/build/toastr.min.css';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import routes from './_routes/routes'

import Home from './HomePage/HomePage'
import LoginMain from './UserManagement/LoginMain'
import NotFound from './ErrorPage/notfound'
//window.jQuery = window.$ = require('jquery')
//require('bootstrap')
//{renderRoutes(routes)}
//<Route exact path='/' component={Home}/>
//<Route path='/login' component={LoginMain}/>

if (process.env.NODE_ENV !== 'production') {
   console.log('Looks like we are in development mode!');
}

render((
    <Provider store={store}>
        <BrowserRouter>
            {renderRoutes(routes, {store:store})}
        </BrowserRouter>
    </Provider>
), document.getElementById('reactbody'));
