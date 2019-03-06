import React from 'react';
import { Link } from 'react-router-dom';
import RangePicker from './RangePicker';
import { matchRoutes } from 'react-router-config'
import routes from '../_routes/routes'

class HeaderNav extends React.Component {
    constructor(props) {
        super(props);
      }

    render() {
        console.log(matchRoutes(routes, window.location.pathname));
        return (
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
                <a className="navbar-brand nav-link col-sm-3 col-md-2 mx-0" style={{textAlign: "center", fontWeight: "bold"}} href="/">IIoT Monitor</a>
                <ul style={{float:"left", width: "100%", marginBottom: 0}}>
                  {window.location.pathname != '/' && <RangePicker dispatch={this.props.dispatch}/>}
                </ul>
                <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap">
                        <Link to="/login" className="nav-link">Logout</Link>
                    </li>
                </ul>
            </nav>
        );
    }

}


export default HeaderNav
