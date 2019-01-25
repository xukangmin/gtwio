import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class TempPlot extends React.Component {
  constructor(props){
    super(props);

    let temp = []
    for (var i=0; i<4; i++){
      temp.push({
        x: this.props.data[i].Data.map((item,i)=>new Date(item.TimeStamp).toLocaleTimeString("en-US")),
        y: this.props.data[i].Data.map((item,i)=>item.Value),
        type: 'scatter',
        name: this.props.data[i].SerialNumber
      })
    }

    this.state={
      data: temp
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
      <div id="plot"></div>
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
