import React from 'react';
import { connect } from 'react-redux';
import {RadialGauge} from '../react-canvas-gauges'

class Gauge extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let {data, asset} = this.props;
    let boxSize = window.innerWidth/4-20;
    let humidity = data.Data[0].Name==="Humidity";
    let title = data.Data[0].ParameterList[0].Value.toFixed(2) + (humidity ? "%" : "°F");
    let max = humidity ? 100 : 120;
    let range = humidity ? [0, 20, 40, 60, 80, 100] : [0, 20, 40, 60, 80, 100, 120];
    let highlight = humidity ? {"from": 75, "to": 100, "color": "rgba(200, 50, 50, .75)"} : {"from": 100, "to": 120, "color": "rgba(200, 50, 50, .75)"};
    return(
      <div style={{width: "50%", display: "flex", justifyContent: "center"}}>
      <a href={"/asset/" + asset + "/tag/" + data.TagName + "?tab=1&SensorShow=true&Type=" + data.Data[0].Name}>
        <RadialGauge
        units={data.TagName}
        title={title}
        fontUnitsSize={40}
        fontTitleSize={65}
        fontTitleWeight="bold"
        value={data.Data[0].ParameterList[0].Value}
        width={boxSize}
        height={boxSize-50}
        minValue={0}
        maxValue={max}
        startAngle={90}
        ticksAngle={180}
        valueBox={false}
        maxValue={max}
        majorTicks={range}
        minorTicks="2"
        strokeTicks={true}
        highlights={[highlight]}
        colorPlate="#fff"
        borderShadowWidth="0"
        borders={false}
        needleType="arrow"
        needleWidth="2"
        needleCircleSize="7"
        needleCircleOuter="true"
        needleCircleInner="false"
        animationDuration={1500}
        animationRule={"linear"}
        ></RadialGauge>
      </a></div>
      
    );
  }
}


function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(Gauge);
export { connectedPage as Gauge };
