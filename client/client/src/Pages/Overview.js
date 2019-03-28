import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import AssetsList from '../Pages/AssetsList';
import AddAsset from '../Modals/AddAsset';

import { assetActions } from '../_actions/assetAction';

class Overview extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));

    if (this.user)
    {
      this.props.dispatch(assetActions.getAssets(this.user));
    }
  }

  render() {
    const { assets } = this.props;
    let assets_display = null;
    if (assets){
      assets_display = assets;
    }
    else if (this.assets_local){
      assets_display = this.assets_local;
    }

    if (!this.user){
      return (<Redirect to='/login' />);
    }
    else {
      return (
        <div>
          {assets_display ?
          <div>
              <div style={{marginBottom: "15px"}}>
                <AddAsset user={this.user} dispatch={this.props.dispatch}/>
              </div>
              <div>
                <AssetsList assets={assets_display} user={this.user} dispatch={this.props.dispatch}/>
              </div>
          </div> 
          :
          <div></div>
          }
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

const connectedPage = connect(mapStateToProps)(Overview);
export { connectedPage as Overview };
