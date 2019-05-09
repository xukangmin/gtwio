import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Samy, SvgProxy } from 'react-samy-svg';
import HxSvg from 'raw-loader!../../Images/Hx.svg';
import Loader from '../../Widgets/Loader';
import { Progress, Icon } from 'antd';
import '../../Root/antd.css';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset = props.match.params.assetID;

    this.HandleText = this.HandleText.bind(this);  
    this.HandleTitle = this.HandleTitle.bind(this);  
  }  

  render() {
    const { assetData, assetTags } = this.props;

    const Hx_style = {
      maxWidth: "1200px",
      maxHeight: "560px"
    };

    let progressBars, cleanliness, heatFlow, heatBalanceError;
    if (assetTags){
      if (assetTags.find(tag => tag.TagName == "ProgressBars")){
        progressBars = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data;
        cleanliness = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "CLEANLINESS_FACTOR").ParameterList.find(active=>active.Active == 1);
        heatFlow = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "HEAT_TRANSFER_RATE").ParameterList.find(active=>active.Active == 1);
        heatBalanceError = assetTags.filter(tag => tag.TagName == "ProgressBars")[0].Data.find(item=> item.AssignedTag == "HEAT_BALANCE_ERROR").ParameterList.find(active=>active.Active == 1);
      }      
    }

    if (!this.user){
      return (<Redirect to='/login'/>);
    } else{
      return (
        <div>
        {assetData && assetTags ?
          <div style={Hx_style} className="mx-auto">
            <Samy svgXML={HxSvg}>
              { assetTags.map((item,i) =>
                  <SvgProxy selector={"#" + item.TagName} key={i} onElementSelected={(elem => this.HandleText(elem, item))} />
                )
              }
              <SvgProxy selector={"#asset_name"} onElementSelected={elem => this.HandleTitle(assetData)} />
            </Samy>
            <Row>
              <div style={{width: '50%', marginTop: "-150px", display: 'flex', textAlign: 'center'}}>
              { cleanliness &&
                <div style={{width: "200px"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + cleanliness.ParameterID}>
                    <Progress 
                    type="dashboard" 
                    strokeLinecap="square"
                    width={140}
                    percent={cleanliness.Range ? ((cleanliness.Value-cleanliness.Range.LowerLimit)/(cleanliness.Range.UpperLimit-cleanliness.Range.LowerLimit))*100 : 0} 
                    format={()=>!isNaN(cleanliness.Value) ? cleanliness.Value.toFixed(2) : "N/A"} /> 
                    <p style={{position: "relative", top: "-40", fontSize: "0.7em"}}>±{progressBars.find(item=> item.AssignedTag == "CLEANLINESS_FACTOR_UNCERTAINTY").ParameterList.find(active=>active.Active == 1).Value.toFixed(2)}</p>
                    <p style={{position: "relative", top: "-30"}}><strong>Cleanliness Factor</strong></p>
                  </a>
                </div>                
              }
              { heatFlow &&
                <div style={{width: "200px"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + heatFlow.ParameterID}>
                    <Progress 
                    type="dashboard"
                    strokeLinecap="square"
                    width={140} 
                    percent={heatFlow.Range ? ((heatFlow.Value-heatFlow.Range.LowerLimit)/(heatFlow.Range.UpperLimit-heatFlow.Range.LowerLimit))*100 : 0} 
                    format={()=>!isNaN(heatFlow.Value) ? parseInt(heatFlow.Value).toLocaleString('en') : "N/A"} /> 
                    
                    <p style={{position: "relative", top: "-40", fontSize: "0.7em"}}>±{parseInt(progressBars.find(item=> item.AssignedTag == "HEAT_TRANSFER_RATE_UNCERTAINTY").ParameterList.find(active=>active.Active == 1).Value).toLocaleString('en')}</p>
                    <p style={{position: "relative", top: "-30"}}><strong>Heat Transfer Rate<br/>(btu/hr)</strong></p>
                  </a>
                </div>                
              }
              { heatBalanceError &&
                <div style={{width: "200px", position: "relative"}}>
                  <a href={"/asset/" + assetData.AssetID + "/parameter/" + heatBalanceError.ParameterID}>
                    <Progress 
                    type="dashboard" 
                    strokeLinecap="square"
                    width={140}
                    percent={heatBalanceError.Range ? ((heatBalanceError.Value-heatBalanceError.Range.LowerLimit)/(heatBalanceError.Range.UpperLimit-heatBalanceError.Range.LowerLimit))*100 : 0} 
                    format={()=>!isNaN(heatBalanceError.Value) ? heatBalanceError.Value.toFixed(2) + "%" : "N/A"} 
                    status={progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").Value < heatBalanceError.Value.toFixed(0) ? "exception" : "normal"}/>                    
                    <p style={{position: "absolute", top: "0", right: "20", color: progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").ParameterList.find(active=>active.Active == 1).Value < heatBalanceError.Value.toFixed(0) ? "red" : "green", fontSize: "1.5em"}}>{progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").ParameterList.find(active=>active.Active == 1).Value < heatBalanceError.Value.toFixed(0) ? <Icon type="exclamation-circle" /> : <Icon type="check-circle" />}</p>
                    <p style={{position: "relative", top: "-40", fontSize: "0.7em"}}>±{progressBars.find(item=> item.AssignedTag == "UNCERTAINTY_HBE").ParameterList.find(active=>active.Active == 1).Value.toFixed(2)}%</p>
                    <p style={{position: "absolute", top: "135", left: "0", right: "0"}}><strong>Heat Balance Error</strong></p>
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

  HandleText(elem, tag){
    var temp_obj = tag.Data.find(item => item.Name === "Temperature").ParameterList.find(active=>active.Active==1);
    var flow_obj = tag.Data.find(item => item.Name === "FlowRate") && tag.Data.find(item => item.Name === "FlowRate").ParameterList.find(active=>active.Active==1);

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
  }

  HandleTitle(assetData){
    document.getElementById("asset_name").innerHTML = assetData.DisplayName;
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
