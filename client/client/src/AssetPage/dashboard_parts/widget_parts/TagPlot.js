import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { dataActions } from '../../../_actions/dataAction';
import Plot from 'react-plotly.js';

import DateRangePicker from 'react-bootstrap-daterangepicker';
// you will need the css that comes with bootstrap@3. if you are using
// a tool like webpack, you can do the following:
import 'bootstrap/dist/css/bootstrap.css';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';

class TagPlot extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      plot_Interval: 10,
      start: Date.now()-10*60*1000,
      end: Date.now()
    }

    // this.dispatchTagContinuously = setInterval(() => {
    //   this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, Date.now()-this.state.plot_Interval*60*1000, Date.now()));
    // }, 5000);
  }



  render(){
    const { DeviceData } = this.props;

    let formattedData = [];

    let layout = {
      yaxis: {
        range: [0,100],
        ticklen: 8
      },
      xaxis: {
        showline: false,
        autotick: false,
        ticklen: 8,
        dtick: this.state.plot_Interval*0.8
      },
      margin:{
        l: 40,
        t: 30
      }
    }

    for (var i = 0; i < DeviceData.length; i++){
      formattedData.push({
        x: DeviceData[i].Data.map((item,i) => new Date(item.TimeStamp).toLocaleTimeString("en-US")),
        y: DeviceData[i].Data.map((item,i) => item.Value),
        type: 'scatter',
        name: DeviceData[i].SerialNumber
      })
    }

    return(
      <div>
        <DateRangePicker startDate="1/1/2014" endDate="3/1/2014">
          <button>Click Me To Open Picker!</button>
        </DateRangePicker>

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
