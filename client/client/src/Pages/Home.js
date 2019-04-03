import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Loader from '../Widgets/Loader';
 
import List from './Asset/List';
import AddAsset from '../Modals/AddAsset';

import { assetActions } from '../_actions/assetAction';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    if (this.user){
      this.props.dispatch(assetActions.getAssets(this.user));
    }
  }

  render() {
    const { assets } = this.props;

    if (!this.user){
      return (<Redirect to='/login' />);
    }
    else {
      return (
        <div>
          {assets?
          <div>
              <div style={{marginBottom: "15px"}}>
                <AddAsset user={this.user} dispatch={this.props.dispatch}/>
              </div>
              <div>
                <List assets={assets} user={this.user} dispatch={this.props.dispatch}/>
              </div>
          </div> 
          :
          <Loader/>
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

const connectedPage = connect(mapStateToProps)(Home);
export { connectedPage as Home };
