import React from 'react';
import { Link } from 'react-router-dom';
import RangePicker from './RangePicker';

class HeaderNav extends React.Component {
    constructor(props) {
        super(props);
      }

    render() {
        return (
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
                <a className="navbar-brand nav-link col-sm-3 col-md-2 mx-0" style={{textAlign: "center", fontWeight: "bold"}} href="/">IIoT Monitor</a>
                <ul style={{float:"left", width: "100%", marginBottom: 0}}>

                  <RangePicker/>

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
