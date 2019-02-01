import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class ParameterPlot extends React.Component {
  constructor(props){
    super(props);
    let tempX = [];
    let tempY = [];
    for (var i=0; i<this.props.data.length; i++){
      tempX.push(new Date(this.props.data[i].TimeStamp).toLocaleTimeString("en-US"));
      tempY.push(this.props.data[i].Value)
    }

    this.state = {
      data: {
        x: tempX,
        y: tempY,
        type: 'scatter'
      },
      layout:{
        yaxis: {
          range: [0,100]
        },
        xaxis:{
          showline: false,
          autotick: false,
          ticklen: 8,
          dtick: 5
        }
      }
    }
  }

  render(){
    return(
      <Plot
          data={[this.state.data]}
          layout={this.state.layout}
          style={{width:"100%"}}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

const connectedPage = connect(mapStateToProps)(ParameterPlot);
export { connectedPage as ParameterPlot };
