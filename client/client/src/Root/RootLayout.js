import React, {Component} from 'react';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Menu from '../Pages/Menu'
import Header from '../Pages/Header'

import { assetActions } from '../_actions/assetAction'

import './root.css'
import Loader from '../Pages/Loader'

class RootLayout extends Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets_local = JSON.parse(localStorage.getItem('assets'));
    if (this.user && !this.assets_local)
    {
      this.props.dispatch(assetActions.getAssets(this.user));
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
          <Header dispatch={this.props.dispatch}/>
          <div className ="container-fluid">
            {assets_display ?
            <div className ="row">
              <Menu assets={assets_display} dispatch={this.props.dispatch}/>
              <main role="main" className ="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
                    {renderRoutes(this.props.route.routes, {store : this.props.store})}
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
