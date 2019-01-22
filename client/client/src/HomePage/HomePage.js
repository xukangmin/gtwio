import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'
import MainArea from './parts/mainArea'
import AddNewAssets from './parts/addNewAssets'

import { dataActions } from '../_actions/dataAction'
import { assetActions } from '../_actions/assetAction'

import Loader from '../_components/loader'

class HomePage extends React.Component {
  constructor(props) {
    super(props);

   /* this.state = {
                    assets: [
                      {
                        DisplayName: 'Asset 1',
                        LatestTimeStamp: 123,
                        DeviceCount: 30,
                        AssetID: '123'
                      },
                      {
                        DisplayName: 'Asset 2',
                        LatestTimeStamp: 123,
                        DeviceCount: 40,
                        AssetID: '789'
                      },
                      {
                        DisplayName: 'Asset 3',
                        LatestTimeStamp: 333,
                        DeviceCount: 20,
                        AssetID: '31'
                      }
                        ]
                  }*/
    // first Get user's assets info with interval 10s
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets_local = JSON.parse(localStorage.getItem('assets'));

    if (this.user && !this.assets_local)
    {
      this.props.dispatch(assetActions.getAssetsOverview(this.user));
    }
    console.log("called!!!!!!!!!!!!!!");

  }

  componentDidMount() {
   //this.props.dispatch(assetActions.getAssetsOverview(this.user));
    this.startTimer();
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  startTimer () {
    clearInterval(this.timer);
    this.timer = setInterval(this.tick.bind(this), 5000);
  }

  stopTimer () {
    clearInterval(this.timer)
  }

  tick () {
    //this.props.dispatch(assetActions.getAssetsOverview(this.user));
    //this.props.dispatch();
    //this.props.dispatch(assetActions.getAssetsOverview(this.user));
  }



  render() {
    //const { assets } = this.state;
    const { assets, msg } = this.props;

    let assets_display = null;

    if (assets)
    {
      assets_display = assets;
    }
    else if (this.assets_local)
    {
      assets_display = this.assets_local;
    }

    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
          <div>
          {assets_display ?
           <div>
              <div>
              <AddNewAssets user={this.user} dispatch={this.props.dispatch}/>
              </div>
              <div>
              <MainArea assets={assets_display} />
              </div>

          </div> :
          <div></div>}
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

const connectedPage = connect(mapStateToProps)(HomePage);
export { connectedPage as HomePage };
