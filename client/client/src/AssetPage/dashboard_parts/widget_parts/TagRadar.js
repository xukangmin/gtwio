import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class TagRadar extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { DeviceData } = this.props;

    let SerialNumberList = DeviceData.map((singleDevice,i) => singleDevice.SerialNumber);
    SerialNumberList.push(SerialNumberList[0]);

    let CurrentValueList = DeviceData.map((singleDevice,i) => singleDevice.Data[0].Value);
    CurrentValueList.push(CurrentValueList[0]);

    let MeanValueList = DeviceData.map((singleDevice,i) => singleDevice.DataStatistics.Avg);
    MeanValueList.push(MeanValueList[0]);

    let MaxValueList = DeviceData.map((singleDevice,i) => (singleDevice.DataStatistics.Avg+0.5));
    MaxValueList.push(MaxValueList[0]);

    let MinValueList = DeviceData.map((singleDevice,i) => (singleDevice.DataStatistics.Avg-0.5));
    MinValueList.push(MinValueList[0]);

    let PlotMax = Math.ceil(Math.max(...DeviceData.map((singleDevice,i) => singleDevice.DataStatistics.Max)))+1;
    let PlotMin = Math.floor(Math.min(...DeviceData.map((singleDevice,i) => singleDevice.DataStatistics.Min)))-1;

    const data = [{
      name: 'Upper Alarm Limit',
      type: 'scatterpolar',
      r: [PlotMax, PlotMax, PlotMax, PlotMax, PlotMax],
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(246, 71, 71, 0.2)'},
      fillcolor: 'rgba(246, 71, 71, 0.2)',
      fill: "toself"
    },
    {
      name: 'Valid',
      type: 'scatterpolar',
      r: MaxValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(200, 247, 197, 0.8)'},
      fill: "toself"
    },
    {
      name: 'Lower Alarm Limit',
      type: 'scatterpolar',
      r: MinValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(246, 71, 71, 0.2)'},
      fillcolor: 'rgba(246, 71, 71, 0.2)',
      fill: "toself"
    },
    {
      name: 'Current Value',
      type: 'scatterpolar',
      r: CurrentValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(0, 181, 204, 1)'}
    },
    {
      name: 'Mean Value',
      type: 'scatterpolar',
      r: MeanValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'gray', dash: 'dot'}
    }];

    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          tickangle: 90,
          angle: 90,
          range: [PlotMin, PlotMax]
        }
      },
      showlegend: false,
      margin:{
        l: 40,
        t: 40
      }
    }
    return(
        <Plot
          data = {data}
          layout = {layout}
          style = {{width:"100%"}}
        />
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.data;
  return {
      DeviceData: data
  };
}

const connectedPage = connect(mapStateToProps)(TagRadar);
export { connectedPage as TagRadar };
