import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { dataActions } from '../_actions/dataAction'
import './asset.css'
import Loader from '../_components/loader'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'
import { renderRoutes } from 'react-router-config'
import { NavLink } from 'react-router-dom'

class AssetMain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        AssetID : props.match.params.assetID
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
    // data will update every 1 minute on this page


  }

  render() {
    //const { assets } = this.state;
    const { AssetID } = this.state;
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
          <div className ="tab-content">
            {renderRoutes(this.props.route.routes, {store : this.props.store})}
          </div>
      );
      // <ul className="nav nav-pills">
      //   <li className="nav-item"><NavLink className="nav-link" to={"/asset/" + AssetID + "/overview"} activeClassName="active" >Overview</NavLink></li>
      //   <li className="nav-item"><NavLink className="nav-link" to={"/asset/" + AssetID + "/dashboard"} activeClassName="active" >Dashboard</NavLink></li>
      //   <li className="nav-item"><NavLink className="nav-link" to={"/asset/" + AssetID + "/device"} activeClassName="active" >Devices</NavLink></li>
      //   <li className="nav-item"><NavLink className="nav-link" to={"/asset/" + AssetID + "/report"} activeClassName="active" >Reports</NavLink></li>
      //   <li className="nav-item"><NavLink className="nav-link" to={"/asset/" + AssetID + "/alert"} activeClassName="active" >Alerts</NavLink></li>
      // </ul>
    }

  }
}

function mapStateToProps(state) {
  const { data, msg } = state.data
  return {
      assets : data,
      msg: msg
  };
}

const connectedPage = connect(mapStateToProps)(AssetMain);
export { connectedPage as AssetMain };
