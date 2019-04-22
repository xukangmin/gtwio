import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Loader from '../Widgets/Loader';
 
class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  //alert
  //columns to show on Data
  //refresh interval
  render() {
      return(
        <div>
        <h3>Settings</h3>
        <p>alert</p>
    </div>
      )
   
  }
}

function mapStateToProps(state) {
    const { data, msg } = state.asset
    return {
        assets : data,
        msg: msg
    };
  }

const connectedPage = connect(mapStateToProps)(Settings);
export { connectedPage as Settings };
