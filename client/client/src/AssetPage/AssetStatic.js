import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import './asset.css';
import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import update from 'immutability-helper';
import { dashboardActions } from '../_actions/dashboardAction';
import { Samy, SvgProxy } from 'react-samy-svg';
import svgcontents from 'raw-loader!../AssetPage/svg/HeatExchanger_new.svg';

function createDefaultDashboard(assetid, dispatch) {
    dispatch(dashboardAction.addDashboard(assetid, {

    }));
}


class AssetStatic extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(dashboardActions.getDashboards(props.match.params.assetID));
    console.log(props)
    this.state = {
         AssetID: props.match.params.assetID
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
  }


  render() {
    const { AssetID} = this.state;
    const { dashboardData } = this.props;
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div>
        {dashboardData ?
          <div className="container-fluid">
            <h1>Asset: {AssetID}</h1>
            <Samy svgXML={svgcontents} >
            </Samy>
          </div>
          :
          <Loader />}

      </div>
      );
    }

  }
}

function mapStateToProps(state) {
  const { data } = state.dashboard;
  return {
      dashboardData : data
  };
}

const connectedPage = connect(mapStateToProps)(AssetStatic);
export { connectedPage as AssetStatic };
