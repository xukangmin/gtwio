import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class ParameterPlot extends React.Component {
  constructor(props){
    super(props);
    let tempX = [];
    let tempY = [];
    for (var i=0; i<this.props.data.length; i++){
      tempX.push(new Date(this.props.data[i].TimeStamp).toLocaleTimeString("en-US"));
      tempY.push(this.props.data[i].Value)
    }

    this.state={
      data: {
        x: tempX,
        y: tempY,
        type: 'scatter'
      }
    }
  }

  plot() {
      const layout = {
        yaxis: {
          range: [0,100]
        }
      }
      Plotly.newPlot('parameterPlot', [this.state.data], layout);
  }

  componentDidMount () {
      this.plot();
  }

  render(){
    return(
      <div id="parameterPlot"></div>
    );
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(ParameterPlot);
export { connectedPage as ParameterPlot };
