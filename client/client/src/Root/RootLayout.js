import React, {Component} from 'react';
import Link from 'react-router-dom/Link';
import Route from 'react-router-dom/Route';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'

import { dataActions } from '../_actions/dataAction'
import { assetActions } from '../_actions/assetAction'

import './root.css'
import Loader from '../_components/loader'

class RootLayout extends Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets_local = JSON.parse(localStorage.getItem('assets'));
    if (this.user && !this.assets_local)
    {
      this.props.dispatch(assetActions.getAssetsOverview(this.user));
    }
  }


    render() {
      const { assets, msg } = this.props;

      let assets_display = null;
      if (this.assets_local)
      {
        assets_display = this.assets_local;
      }
      else{
        assets_display = assets;
      }

      if (!this.user)
      {
        return (<Redirect to='/login' />);
      }
      else{
        return (
          <div id="home-page-main">
          <HeaderNav dispatch={this.props.dispatch} />
          <div className ="container-fluid">
            {assets_display ?
            <div className ="row">
              <SideNav assets={assets_display}/>
              <main role="main" className ="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
                    {renderRoutes(this.props.route.routes, {store : this.props.store})}
                    {/*<MainArea assets={assets_display} />
                    <AddNewAssets user={this.user} dispatch={this.props.dispatch} />*/}
              </main>
            </div>
            : <Loader />
            }
          </div>
        </div>

        );
      }
    }
  }
  function mapStateToProps(state) {
    const { data, msg } = state.asset
    return {
        assets : data,
        msg: msg
    };
  }

  const connectedPage = connect(mapStateToProps)(RootLayout);
  export { connectedPage as RootLayout };
