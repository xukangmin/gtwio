import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';

class TempRadar extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let { DeviceData } = this.props;
    let data = [{
      type: 'scatterpolar',
      r: DeviceData.map((singleDevice,i) => singleDevice.Data[0].Value),
      theta: DeviceData.map((singleDevice,i) => singleDevice.SerialNumber),
      fill: 'toself'
    }];
    let layout = {
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
          data={data}
          layout={layout}
          style={{width:"100%"}}
        />
    );
  }
}

function mapStateToProps(state) {
  const device = state.data.data;
  return {
      DeviceData: device
  };
}

const connectedPage = connect(mapStateToProps)(TempRadar);
export { connectedPage as TempRadar };
