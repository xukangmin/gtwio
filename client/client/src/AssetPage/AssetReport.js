import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { dataActions } from '../_actions/dataAction'
import './asset.css'
import Loader from '../_components/loader'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'

class AssetReport extends React.Component {
  constructor(props) {
    super(props);
    console.log("test");
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
        <div>
           <p>Report</p>
         </div>
      );
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

const connectedPage = connect(mapStateToProps)(AssetReport);
export { connectedPage as AssetReport };
