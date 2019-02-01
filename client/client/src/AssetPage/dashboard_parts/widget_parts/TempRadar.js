import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class TempRadar extends React.Component {
  constructor(props){
    super(props);
    this.state={
      type: "radar",
      data : [{
        type: 'scatterpolar',
        r: this.props.data.map((singleDevice,i) => singleDevice.Data[0].Value),
        theta: this.props.data.map((singleDevice,i) => singleDevice.SerialNumber),
        fill: 'toself'
      }],
      layout : {
        polar: {
          radialaxis: {
            visible: true,
            range: [0, Math.ceil(Math.max(...this.props.data.map((singleDevice,i) => singleDevice.Data[0].Value)))]
          }
        },
        showlegend: false,
        margin:{
          l: 80,
          t: 80
        }
      }
  }
}

  render(){
    return(
        <Plot
          data={this.state.data}
          layout={this.state.layout}
          style={{width:"100%"}}
        />
    );
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(TempRadar);
export { connectedPage as TempRadar };
