import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Samy, SvgProxy } from 'react-samy-svg';
import HxSvg from 'raw-loader!../../Images/Hx.svg';
import Loader from '../../Widgets/Loader';
import { Gauge } from '../../Widgets/Gauge';
import { Progress, Icon, Button } from 'antd';
const ButtonGroup = Button.Group;
import '../../Root/antd.css';
import { assetActions } from '../../_actions/assetAction';


class TempGauge extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset = props.match.params.assetID;
  }  

  render() {
    let height = window.innerHeight-150;
    let gauges = this.props.assetTags;
    console.log(gauges)
    return(
      <div style={{marginTop: "55px", width: "100%", height: height, display: "flex", justifyContent: "space-around", flexWrap: 'wrap', alignItems: 'center', alignContent: 'space-evenly'}}>
      
        {gauges ? 
          gauges.map((x,i)=><Gauge key={i} data={x} asset={this.asset}/>)
          :<Loader/>}
      
    </div>
    )
       
    }
  }

  

function mapStateToProps(state) {
  const { data, tags } = state.asset;
  return {
      assetData : data,
      assetTags : tags
  };
}

const connectedPage = connect(mapStateToProps)(TempGauge);
export { connectedPage as TempGauge };
