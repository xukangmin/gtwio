import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class Temperature extends React.Component {
  constructor(props){
    super(props);
    this.state={
      name: "radar",
      data : [{
        type: 'scatterpolar',
        r: [39, 28, 8, 7],
        theta: ['A','B','C', 'D'],
        fill: 'toself'
      }],
      layout : {
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 50]
          }
        },
        showlegend: false
        }

  }

}

plot() {
    Plotly.newPlot('plot' + this.state.name, this.state.data, this.state.layout, {displayModeBar: false});
}
componentDidMount () {
    this.plot();
}

  render(){
    return(
      <div id={"plot" + this.state.name} >
      </div>);
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(Temperature);
export { connectedPage as Temperature };
