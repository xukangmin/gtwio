import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class TagRadar extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { data } = this.props;

    let SerialNumberList = data.map((singleDevice,i) => singleDevice.SerialNumber);
    SerialNumberList.push(SerialNumberList[0]);

    let CurrentValueList = data.map((singleDevice,i) => singleDevice.Parameters[0].CurrentValue.toFixed(2));
    CurrentValueList.push(CurrentValueList[0]);


    let CurrentValueMean = data.map((singleDevice,i) => singleDevice.Parameters[0].CurrentValue.toFixed(2)).reduce((p,c,_,a) => p + c/a.length,0);
    let MeanValueList = [CurrentValueMean, CurrentValueMean, CurrentValueMean, CurrentValueMean, CurrentValueMean]

    let ValueMax = CurrentValueMean + 0.5;
    let MaxValueList = [ValueMax, ValueMax, ValueMax, ValueMax, ValueMax]

    let ValueMin = CurrentValueMean - 0.5;
    let MinValueList = [ValueMin, ValueMin, ValueMin, ValueMin, ValueMin]

    let PlotMax = Math.ceil(Math.max(...data.map((singleDevice,i) => singleDevice.Parameters[0].DataStatistics.Max)))+1;
    let PlotMin = Math.floor(Math.min(...data.map((singleDevice,i) => singleDevice.Parameters[0].DataStatistics.Min)))-1;

    const plotData = [{
      name: 'Upper Alarm Limit',
      type: 'scatterpolar',
      r: [PlotMax, PlotMax, PlotMax, PlotMax, PlotMax],
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(246, 71, 71, 0.2)'},
      fillcolor: 'rgba(246, 71, 71, 0.5)',
      fill: 'toself'
    },
    {
      name: 'Valid',
      type: 'scatterpolar',
      r: MaxValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(200, 247, 197, 0.8)'},
      fillcolor: 'rgba(200, 247, 197, 0.75)',
      fill: 'toself'
    },
    {
      name: 'Lower Alarm Limit',
      type: 'scatterpolar',
      r: MinValueList,
      theta: SerialNumberList,
      mode: 'lines',
      line: {color: 'rgba(246, 71, 71, 0.2)'},
      fillcolor: 'rgba(246, 71, 71, 0.5)',
      fill: 'toself'
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
      title: '(°F)',
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
        t: 50
      }
    }
    return(
        <Plot
          data = {plotData}
          layout = {layout}
          style = {{width:"100%"}}
        />
    );
  }
}

function mapStateToProps(state) {

  return {
  };
}

const connectedPage = connect(mapStateToProps)(TagRadar);
export { connectedPage as TagRadar };
