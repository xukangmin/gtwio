import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

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
            range: [Math.round(Math.min(...this.props.data.map((singleDevice,i) => singleDevice.Data[0].Value))/10-1)*10, Math.round(Math.max(...this.props.data.map((singleDevice,i) => singleDevice.Data[0].Value))/10)*10]
          }
        },
        showlegend: false
      }
  }
  console.log()
}

plot() {
    Plotly.newPlot('plot' + this.state.type, this.state.data, this.state.layout, {displayModeBar: false});
}

componentDidMount () {
    this.plot();
}

  render(){
    return(
        <div id={"plot" + this.state.type} >
        </div>
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
