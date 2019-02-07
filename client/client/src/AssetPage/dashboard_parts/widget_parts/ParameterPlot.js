import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class ParameterPlot extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { parameterData } = this.props;

    parameterData.sort((a,b) => a.TimeStamp - b.TimeStamp);

    let tempX = [];
    let tempY = [];
    for(var i = 0; i < parameterData.length; i++){
      tempX.push(new Date(parameterData[i].TimeStamp).toLocaleTimeString("en-US"));
      tempY.push(parameterData[i].Value)
    }

    const data= {
      x: tempX,
      y: tempY,
      type: 'scatter'
    };

    const layout= {
      yaxis: {
        range: [0,100]
      },
      xaxis:{
        showline: false,
        autotick: false,
        ticklen: 8,
        dtick: 9
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
        parameterData: data
    };
}

const connectedPage = connect(mapStateToProps)(ParameterPlot);
export { connectedPage as ParameterPlot };
