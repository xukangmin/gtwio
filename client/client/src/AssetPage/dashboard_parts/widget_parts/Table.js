import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class Table extends React.Component {
  constructor(props){
    super(props);
    this.state={
      type: "table",
      data : [{
        type: 'table',
        header: {
          values: [["Device"], ["Temperature"]],
          align: "center",
          line: {width: 1, color: 'black'},
          fill: {color: "#eee"},
          font: {size: 16}
        },
        cells: {
          values: [
            ['Device1', 'Device2', 'Device3', 'Device4'],
            [95, 85, 75, 65]
          ],
          align: "center",
          line: {color: "black", width: 1}
        }
      }]
    }
  }

  plot() {
      Plotly.newPlot('plot' + this.state.type, this.state.data);
  }

  componentDidMount () {
      this.plot();
  }

  render(){
    return(
      <div>
        <div id={"plot" + this.state.type} >
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(Table);
export { connectedPage as Table };
