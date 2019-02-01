import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class ParameterPlot extends React.Component {
  constructor(props){
    super(props);
  }

  sortTime(data){
    return(data.sort(
      function(a,b){
        var TimeA = a;
        var TimeB = b;
        if (TimeA > TimeB) {
          return 1;
        }
        if (TimeA < TimeB) {
          return -1;
        }
        return 0;
      }
    ))
  }

  render(){
    let {parameterData} = this.props;
    let tempX = [];
    let tempY = [];
    for (var i=0; i<parameterData.length; i++){
      tempX.push(new Date(parameterData[i].TimeStamp).toLocaleTimeString("en-US"));
      tempY.push(parameterData[i].Value)
    }

    let data= {
        x: this.sortTime(tempX),
        y: tempY,
        type: 'scatter'
      };
    let layout= {
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
    const parameterdata = state.data.data;
    return {
        parameterData: parameterdata
    };
}

const connectedPage = connect(mapStateToProps)(ParameterPlot);
export { connectedPage as ParameterPlot };
