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
    const data = [{
      type: 'scatterpolar',
      r: DeviceData.map((singleDevice,i) => singleDevice.Data[0].Value),
      theta: DeviceData.map((singleDevice,i) => singleDevice.SerialNumber),
      fill: 'toself'
    }];
    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, Math.ceil(Math.max(...DeviceData.map((singleDevice,i) => singleDevice.Data[0].Value)))]
        }
      },
      showlegend: false,
      margin:{
        l: 80,
        t: 80
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
