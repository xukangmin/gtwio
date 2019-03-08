import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { dataActions } from '../../../_actions/dataAction';
import Plot from 'react-plotly.js';
import DateTimeRangeContainer from 'react-advanced-datetimerange-picker';
import { FormControl, Nav, NavLink, NavItem, TabContent, TabPane } from 'react-bootstrap';
import classnames from 'classnames';
import moment from "moment";

class TagPlot extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { DeviceData } = this.props;

    let formattedData = [];
    let allData = [];

    for (var i = 0; i < DeviceData.length; i++){
      formattedData.push({
        x: DeviceData[i].Data.map((item,i) => moment(new Date(item.TimeStamp)).format("H:mm")),
        y: DeviceData[i].Data.map((item,i) => item.Value.toFixed(2)),
        type: 'scatter',
        name: DeviceData[i].SerialNumber
      })
      allData.push(DeviceData[i].Data.map((item,i) => item.Value));
    }

    let layout = {
      yaxis: {
        range: [Math.min(...allData[0])-10,Math.max(...allData[0])+10],
        ticklen: 8,
        title: "(°F)"
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
  const { data } = state.data;
  return {
      DeviceData: data
  };
}

const connectedPage = connect(mapStateToProps)(TagPlot);
export { connectedPage as TagPlot };
