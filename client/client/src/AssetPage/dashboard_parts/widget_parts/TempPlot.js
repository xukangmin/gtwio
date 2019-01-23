import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class TempPlot extends React.Component {
  constructor(props){
    super(props);
    this.state={
      data: [{
  x: [1, 2, 3, 4],
  y: [10, 15, 13, 17],
  type: 'scatter'
}, {
  x: [1, 2, 3, 4],
  y: [16, 5, 11, 9],
  type: 'scatter'
}]
    }
  }

  plot() {
      Plotly.newPlot('plot', this.state.data);
  }
  componentDidMount () {
      this.plot();
  }

  render(){
    return(
      <div id="plot">
          </div>
    );
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(TempPlot);
export { connectedPage as TempPlot };
