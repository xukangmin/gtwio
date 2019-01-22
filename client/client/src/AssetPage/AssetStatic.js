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

class AssetStatic extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(dashboardActions.getDashboards(props.match.params.assetID));
    
    console.log(props)
    this.state = {
         AssetID: props.match.params.assetID,
         Settings: {
           ShellInlet: {
             temperature: "50.7",
             id: "inletID",
             flow: '9.89'
           },
           ShellOutlet: {
             temperature: "62.4",
             id: "outletID",
             flow: 'N/A'
           },
           TubeInlet: {
             temperature: "92.8",
             id: "tinletID",
             flow: 'N/A'
           },
           TubeOutlet: {
             temperature: "88.4",
             id: "toutletID",
             flow: '9.89'
           }
         }
    }
    this.HandleText = this.HandleText.bind(this);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
  }

  HandleText(elem){
    const { Settings } = this.state;
    console.log(document.getElementById(elem.id+'_flow'))
    elem.children[0].innerHTML = Settings[elem.id].temperature;
    document.getElementById(elem.id+'_id').innerHTML = '(ID: '+ Settings[elem.id].id +')';
    if(document.getElementById(elem.id+'_flow')){
      document.getElementById(elem.id+'_flow').children[0].innerHTML = Settings[elem.id].flow +' gpm';
    }
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
            <div style={{maxWidth: "1000px"}}>
            <Samy svgXML={svgcontents} >
                {Object.keys(this.state.Settings).map((item,i) =>
                  <SvgProxy selector={"#" + item} key={i} onElementSelected={(elem) => this.HandleText(elem)}/>
                )}
            </Samy>
            </div>
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
