import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import moment from "moment";

class MultipleLinesPlot extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { data } = this.props;
    const { unit } = this.props;
    
    let isRangeBiggerThanADay = false;
    if (JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).interval)>=86400){
      isRangeBiggerThanADay = true;
    } else if (!JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).end) - parseInt(JSON.parse(localStorage.getItem('range')).start)>=86400){
      isRangeBiggerThanADay = true;
    }

    let formattedData = [];
    let allData = [];

    for (var i = 0; i < data.length; i++){
      formattedData.push({
        x: data[i].Parameters[0].Data.map((item,i) => isRangeBiggerThanADay ? moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm') : moment(new Date(item.TimeStamp)).format("H:mm")),
        y: data[i].Parameters[0].Data.map((item,i) => item.Value.toFixed(2)),
        type: 'scatter',
        name: data[i].SerialNumber
      });
      allData.push(data[i].Parameters[0].Data.map((item,i) => item.Value));
    }

    let layout = {
      title: 'Line Chart',
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
  return {};
}

const connectedPage = connect(mapStateToProps)(MultipleLinesPlot);
export { connectedPage as MultipleLinesPlot };
