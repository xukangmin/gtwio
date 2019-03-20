import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import update from 'immutability-helper';
import { assetActions } from '../_actions/assetAction';

class AssetNav extends React.Component {
    constructor(props) {
        super(props);
      }

    render() {
      console.log(this.props)
        return (<div></div>)
    }
}


function mapStateToProps(state) {
  const { data } = state.asset;
  return {
      assetData : data
  };
}

export default AssetNav;
