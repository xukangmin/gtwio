import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class ParameterPlot extends React.Component {
  constructor(props){
    super(props);
    console.log('11'+props)
  }

  render(){
    let { parameterData } = this.props;
    let unit = "(°F)";
    if (this.props.unit){
      unit = this.props.unit;
    }
    if (parameterData.length == 1){
      parameterData = parameterData[0];
    }
    parameterData.sort((a,b) => a.TimeStamp - b.TimeStamp);

    let tempX = [];
    let tempY = [];
    for(var i = 0; i < parameterData.length; i++){
      tempX.push(moment(new Date(parameterData[i].TimeStamp)).format('H:mm'));
      tempY.push(parameterData[i].Value)
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
        autorange: true,
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
          style={{width:"100%"}}
      />
    );
  }
}

function mapStateToProps(state) {
    const { data } = state.data;
    return {
        parameterData: data[0]
    };
}

const connectedPage = connect(mapStateToProps)(ParameterPlot);
export { connectedPage as ParameterPlot };
