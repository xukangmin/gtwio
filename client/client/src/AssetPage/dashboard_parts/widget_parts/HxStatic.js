import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../../../_actions/dataAction';
import '../../asset.css';
import Loader from '../../../_components/loader';
import SideNav from '../../../_components/sideNav';
import HeaderNav from '../../../_components/headerNav';
import update from 'immutability-helper';
import { assetActions} from '../../../_actions/assetAction';
import { Samy, SvgProxy } from 'react-samy-svg';
import svgcontents from 'raw-loader!../../svg/HeatExchanger_new.svg';
import { Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Progressbar } from './Progressbar';

class HxStatic extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
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
    // this.assets = JSON.parse(localStorage.getItem('assets'));
  }

  HandleText(elem){
    const { Settings } = this.state;
    elem.children[0].innerHTML = Settings[elem.id].temperature;
    elem.setAttribute('href', "/asset/" + this.state.AssetID + "/tag");
    document.getElementById(elem.id+'_id').innerHTML = '(ID: '+ Settings[elem.id].id +')';
    document.getElementById(elem.id+'_flow').children[0].innerHTML = Settings[elem.id].flow +' gpm';
  }

  render() {
    const { AssetID } = this.state;
    const { assetData } = this.props;
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div>
          {assetData ?
            <div className="container-fluid">
              <div>
                <Breadcrumb>
                  <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
                  <BreadcrumbItem><a href="#">{assetData.DisplayName}</a></BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div style={{maxWidth: "1000px", maxHeight: "560px"}}>
                <Samy svgXML={svgcontents} >
                    {Object.keys(this.state.Settings).map((item,i) =>
                      <SvgProxy selector={"#" + item} key={i} onElementSelected={(elem) => this.HandleText(elem)}/>
                    )}
                </Samy>
                <div style={{float:"right"}}>
                  <span>Last updated:</span>
                </div>
              </div>
              <Row style={{marginTop: "-150px"}}>
                <Progressbar type="Heat Transfer Rate"/>
                <Progressbar type="Efficiency"/>
              </Row>

            </div>
            :
            <Loader />}
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const { data } = state.asset;
  return {
      assetData : data
  };
}

const connectedPage = connect(mapStateToProps)(HxStatic);
export { connectedPage as HxStatic };
