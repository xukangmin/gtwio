import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Row, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Samy, SvgProxy } from 'react-samy-svg';
import HxSvg from 'raw-loader!../../Images/Hx.svg';
import Loader from '../../Widgets/Loader';
import { ProgressBar } from '../../Widgets/ProgressBar';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));

    this.state = {
       AssetID: props.match.params.assetID,
    }

    this.HandleText = this.HandleText.bind(this);    
  }

  HandleText(elem, tag, assetData){
    var temp_obj = tag.Data.find(item => item.Name === "Temperature");
    var flow_obj = tag.Data.find(item => item.Name === "FlowRate");

    if (temp_obj && typeof temp_obj.Value == 'number') {
      elem.children[0].innerHTML = temp_obj.Value.toFixed(2);
    }

    if (tag) {
      elem.setAttribute('href', "/asset/" + this.state.AssetID + "/tag/" + tag.TagName + "?tab=1");
    }

    if (flow_obj) {      
      if (typeof flow_obj.Value == 'number')
      {
        document.getElementById("Rect_" + elem.id + '_flow').style.display = "block";
        document.getElementById(elem.id + '_flow').setAttribute('href', "/asset/" + this.state.AssetID + "/tag/" + tag.TagName + "?tab=2");
        document.getElementById(elem.id + '_flow').children[0].innerHTML = flow_obj.Value.toFixed(2) +' gpm';
      }
    }

    if (assetData) {
      document.getElementById("asset_name").innerHTML = assetData.DisplayName;
    }
  }

  render() {
    const { assetData, AssetTags } = this.props;
    // const progressBars = this.props.AssetTags.filter(item => item.TagName == "ProgressBars");
    const Hx_style = {
      maxWidth: "1200px",
      maxHeight: "560px"
    }
    const ProgressBars_style={
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
          {assetData ?
            <div className="container-fluid">
              <div style={{display: "none"}}>
                <Breadcrumb>
                  <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
                  <BreadcrumbItem><a href="#">{assetData.DisplayName}</a></BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div style={Hx_style} className="mx-auto">
                <Samy svgXML={HxSvg} >
                    {
                      AssetTags &&
                      AssetTags.map((item,i) =>
                        <SvgProxy selector={"#" + item.TagName} key={i} onElementSelected={(elem => this.HandleText(elem, item, assetData))} />
                      )
                    }
                </Samy>
                <Row style={ProgressBars_style}>
                  {AssetTags && AssetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.map((item, i) =>                    
                    <a key={i} href={"/asset/" + assetData.AssetID + "/parameter/" + item.ParameterID}><ProgressBar key={item} type={item.AssignedTag} percentage={item.Value ? item.Value.toFixed(2) : 0} unit={item.Unit}/></a>                    
                  )}
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
      assetData : data,
      AssetTags : tags
  };
}

const connectedPage = connect(mapStateToProps)(Dashboard);
export { connectedPage as Dashboard };
