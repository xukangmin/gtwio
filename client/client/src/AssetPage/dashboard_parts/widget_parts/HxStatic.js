import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import update from 'immutability-helper';
import { dataActions } from '../../../_actions/dataAction';
import { assetActions} from '../../../_actions/assetAction';
import '../../asset.css';
import Loader from '../../../_components/loader';
import SideNav from '../../../_components/sideNav';
import HeaderNav from '../../../_components/headerNav';
import { Samy, SvgProxy } from 'react-samy-svg';
import svgcontents from 'raw-loader!../../svg/HeatExchanger_new.svg';
import { Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Progressbar } from './Progressbar';

class HxStatic extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(assetActions.getSingleAssetDetail(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
    this.state = {
       AssetID: props.match.params.assetID,
    }

    this.HandleText = this.HandleText.bind(this);
    this.user = JSON.parse(localStorage.getItem('user'));

  }

  componentDidMount() {
    this.dispatchParameterContinuously = setInterval(() => {
      this.props.dispatch(assetActions.getSingleAssetDetail(JSON.parse(localStorage.getItem('user')),this.state.AssetID));
    }, 60000);
  }


  HandleText(elem, tag, assetdata){
    var temp_obj = tag.Data.find(item => item.Name === "Temperature");
    var flow_obj = tag.Data.find(item => item.Name === "FlowRate");

    if (temp_obj && typeof temp_obj.Value == 'number')
    {
      elem.children[0].innerHTML = temp_obj.Value.toFixed(2);
    }

    if (tag)
    {
      elem.setAttribute('href', "/asset/" + this.state.AssetID + "/tag/" + tag.TagName + "?tab=1");
    }

    if (flow_obj.Value && typeof flow_obj.Value == 'number')
    {
      document.getElementById("Rect_" + elem.id + '_flow').style.display = "block";
      document.getElementById(elem.id + '_flow').setAttribute('href', "/asset/" + this.state.AssetID + "/tag/" + tag.TagName + "?tab=2");
      document.getElementById(elem.id + '_flow').children[0].innerHTML = flow_obj.Value.toFixed(2) +' gpm';
    }
    if (assetdata)
    {
      document.getElementById("asset_name").innerHTML = assetdata.DisplayName;
    }
  }

  render() {
    const { AssetID } = this.state;
    const { AssetData, AssetTags } = this.props;
    const Hx_style = {
      maxWidth: "1200px",
      maxHeight: "560px"
    }
    const Progressbars_style={
      marginTop: "-150px",
      textAlign: "center"
    }
    const LastUpdate_style={
      float: "right",
      marginTop: "40px",
      fontSize: "0.9em",
      display: "none"
    }

    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div>
          {AssetData ?
            <div className="container-fluid">
              <div style={{display: "none"}}>
                <Breadcrumb>
                  <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
                  <BreadcrumbItem><a href="#">{AssetData.DisplayName}</a></BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div style={Hx_style} className="mx-auto">
                <Samy svgXML={svgcontents} >
                    {
                      AssetTags &&
                      AssetTags.map((item,i) =>
                        <SvgProxy selector={"#" + item.TagName} key={i} onElementSelected={(elem => this.HandleText(elem, item, AssetData))} />
                      )
                    }
                </Samy>
                <Row style={Progressbars_style}>
                  <Progressbar type="Heat Transfer Rate" percentage="77" unit="btu/hr"/>
                  <Progressbar type="Performance Factor" percentage="54" unit="%"/>
                  <Progressbar type="Total Uncertainty" percentage="??" unit="??"/>
                </Row>
                <div style={LastUpdate_style}>
                  <span>Last updated: {new Date().toLocaleTimeString("en-US")}</span>
                </div>
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
  const { data, tags } = state.asset;
  return {
      AssetData : data,
      AssetTags : tags
  };
}

const connectedPage = connect(mapStateToProps)(HxStatic);
export { connectedPage as HxStatic };
