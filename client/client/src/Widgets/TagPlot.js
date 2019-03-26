import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import moment from "moment";

class TagPlot extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { data } = this.props;
    const { unit } = this.props;

    let formattedData = [];
    let allData = [];

    for (var i = 0; i < data.length; i++){
      formattedData.push({
        x: data[i].Parameters[0].Data.map((item,i) => moment(new Date(item.TimeStamp)).format("H:mm")),
        y: data[i].Parameters[0].Data.map((item,i) => item.Value.toFixed(2)),
        type: 'scatter',
        name: data[i].SerialNumber
      });
      allData.push(data[i].Parameters[0].Data.map((item,i) => item.Value));
    }

    let layout = {
      yaxis: {
        range: [Math.min(...allData[0])-10,Math.max(...allData[0])+10],
        ticklen: 8,
        title: "("+unit+")"
      },
      xaxis: {
        showline: false,
        autotick: true,
        ticklen: 8,
        nticks: 10
      },
      margin:{
        l: 50,
        t: 30
      }
    }

    return(
      <div>
        <Plot
          data = {formattedData}
          layout = {layout}
          style = {{width:"100%"}}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

const connectedPage = connect(mapStateToProps)(TagPlot);
export { connectedPage as TagPlot };
