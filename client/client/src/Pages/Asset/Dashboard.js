import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Samy, SvgProxy } from 'react-samy-svg';
import HxSvg from 'raw-loader!../../Images/Hx.svg';
import Loader from '../../Widgets/Loader';
import { Progress, Icon } from 'antd';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset = props.match.params.assetID;

    this.HandleText = this.HandleText.bind(this);    
  }  

  render() {
    const { assetData, assetTags } = this.props;

    const Hx_style = {
      maxWidth: "1200px",
      maxHeight: "560px"
    };

    let progressBars, cleanliness, heatFlow, heatBalanceError;
    if (assetTags){
      progressBars = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data;
      cleanliness = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "CLEANLINESS_FACTOR");
      heatFlow = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "HEAT_FLOW");
      heatBalanceError = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "HEAT_BALANCE_ERROR");
    }

    if (!this.user){
      return (<Redirect to='/login'/>);
    } else{
      return (
        <div>
        {assetData && assetTags ?
          <div style={Hx_style} className="mx-auto">
            <Samy svgXML={HxSvg}>
              { assetTags && assetTags.map((item,i) =>
                  <SvgProxy selector={"#" + item.TagName} key={i} onElementSelected={(elem => this.HandleText(elem, item, assetData))} />
                )
              }
            </Samy>
            <Row>
              <div style={{width: '50%', marginTop: "-150px", display: 'flex', textAlign: 'center'}}>
              { cleanliness &&
                <div style={{width: "180px"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + cleanliness.ParameterID}>
                    <Progress 
                    type="dashboard" 
                    strokeLinecap="square"
                    width={120}
                    percent={((cleanliness.Value-cleanliness.Range.LowerLimit)/(cleanliness.Range.UpperLimit-cleanliness.Range.LowerLimit))*100} 
                    format={()=>cleanliness.Value.toFixed(2)} /> 
                    <p style={{position: "relative", top: "-40", fontSize: "0.7em"}}>±{progressBars.find(item=> item.AssignedTag == "CLEANLINESS_FACTOR_UNCERTAINTY").Value.toFixed(2)}</p>
                    <p style={{position: "relative", top: "-30"}}><strong>{cleanliness.Name}</strong></p>
                  </a>
                </div>                
              }
              { heatFlow &&
                <div style={{width: "180px"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + heatFlow.ParameterID}>
                    <Progress 
                    type="dashboard"
                    strokeLinecap="square"
                    width={120} 
                    percent={((heatFlow.Value-heatFlow.Range.LowerLimit)/(heatFlow.Range.UpperLimit-heatFlow.Range.LowerLimit))*100} 
                    format={()=>heatFlow.Value.toFixed(0)} /> 
                    <p style={{position: "relative", top: "-40", fontSize: "0.7em"}}>±{progressBars.find(item=> item.AssignedTag == "HEAT_FLOW_UNCERTAINTY").Value.toFixed(0)}</p>
                    <p style={{position: "relative", top: "-30"}}><strong>{heatFlow.Name}</strong></p>
                  </a>
                </div>                
              }
              { heatBalanceError &&
                <div style={{width: "180px"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + heatBalanceError.ParameterID}>
                    <Progress 
                    type="dashboard" 
                    strokeLinecap="square"
                    width={120}
                    percent={((heatBalanceError.Value-heatBalanceError.Range.LowerLimit)/(heatBalanceError.Range.UpperLimit-heatBalanceError.Range.LowerLimit))*100} 
                    format={()=>heatBalanceError.Value.toFixed(0)} 
                    status={progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").Value > heatBalanceError.Value.toFixed(0) ? "exception" : "normal"}/>                    
                    <p style={{position: "relative", top: "-80", right: "-40", color: "red", fontSize: "1.2em"}}>{progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").Value > heatBalanceError.Value.toFixed(0) && <Icon type="info-circle" />}</p>
                    <p style={{position: "relative", top: "-24"}}><strong>{heatBalanceError.Name}</strong></p>
                  </a>
                </div>                
              }
              </div>              
            </Row>
          </div>
          :
          <Loader/>
        }
        </div>
      );
    }
  }

  HandleText(elem, tag, assetData){
    var temp_obj = tag.Data.find(item => item.Name === "Temperature");
    var flow_obj = tag.Data.find(item => item.Name === "FlowRate");

    if (temp_obj && typeof temp_obj.Value == 'number') {
      elem.children[0].innerHTML = temp_obj.Value.toFixed(2);
    }

    if (tag) {
      elem.setAttribute('href', "/asset/" + this.asset + "/tag/" + tag.TagName + "?tab=1");
    }

    if (flow_obj) {      
      if (typeof flow_obj.Value == 'number')
      {
        document.getElementById("Rect_" + elem.id + '_flow').style.display = "block";
        document.getElementById(elem.id + '_flow').setAttribute('href', "/asset/" + this.asset + "/tag/" + tag.TagName + "?tab=2");
        document.getElementById(elem.id + '_flow').children[0].innerHTML = flow_obj.Value.toFixed(2) +' gpm';
      }
    }

    if (assetData) {
      document.getElementById("asset_name").innerHTML = assetData.DisplayName;
    }
  }
}

function mapStateToProps(state) {
  const { data, tags } = state.asset;
  return {
      assetData : data,
      assetTags : tags
  };
}

const connectedPage = connect(mapStateToProps)(Dashboard);
export { connectedPage as Dashboard };
