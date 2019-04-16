import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class SingleLinePlot extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let { parameterData, flow, unit } = this.props;
    parameterData.sort((a,b) => a.TimeStamp - b.TimeStamp);

    let tempX = [];
    let tempY = [];
    for(var i = 0; i < parameterData.length; i++){
      tempX.push(moment(new Date(parameterData[i].TimeStamp)).format('H:mm'));
      tempY.push(parameterData[i].Value.toFixed(2));
    }

    const data= {
      x: tempX,
      y: tempY,
      type: 'scatter'
    };

    const layout= {
      title: 'Line Chart',
      yaxis: {
        range: [Math.min(...tempY)-10, Math.max(...tempY)+10],
        ticklen: 8,
        title: unit
      },
      xaxis:{
        showline: false,
        autotick: true,
        nticks: 10,
        ticklen: 8
      }
    };
    
    return(
      <Plot
        data={[data]}
        layout={layout}
        style = {{width: "100%"}}
      />
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(SingleLinePlot);
export { connectedPage as SingleLinePlot };
