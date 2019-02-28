import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { dataActions } from '../../../_actions/dataAction';
import Plot from 'react-plotly.js';

import DateTimeRangeContainer from 'react-advanced-datetimerange-picker'
import {FormControl} from 'react-bootstrap'
import moment from "moment"

class TagPlot extends React.Component {
  constructor(props){
    super(props);

    let now = new Date();
    let start = moment(now).subtract(10, "minutes");
    let end = moment(now);

    this.state = {
        start : start,
        end : end,
        plot_Interval: 10,
        continue_Dispatch: true,
        interval_Updated: false
    }

    this.applyCallback = this.applyCallback.bind(this);
    this.pauseDispatch = this.pauseDispatch.bind(this);
    this.plotUpdated = this.plotUpdated.bind(this);

    this.dispatchTagContinuously = setInterval(() => {
      console.log(this.state.continue_Dispatch);
      if(this.state.continue_Dispatch && !this.state.interval_Updated){
        this.setState({
          start: moment(new Date()).subtract(10, "minutes"),
          end: moment(new Date())
        })
        this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, this.state.start, this.state.end));
      }
    }, 5000);
  }

  applyCallback(startDate, endDate){
    this.setState({
        start: startDate,
        end : endDate,
        plot_Interval : (endDate - startDate)/1000/60,
        continue_Dispatch: true,
        interval_Updated: true
      },
      ()=>this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, this.state.start, this.state.end))
    );
  }

  pauseDispatch(){
    this.setState({
      continue_Dispatch:false
    });
  }

  plotUpdated(){
    console.log('plot')
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

    let now = new Date();
    let start = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0));
    let end = moment(start).add(1, "days").subtract(1, "seconds");
    let ranges = {
      "Today Only": [moment(start), moment(end)],
      "Yesterday Only": [moment(start).subtract(1, "days"), moment(end).subtract(1, "days")],
      "3 Days": [moment(start).subtract(3, "days"), moment(end)]
    }
    let local = {
      "format":"DD-MM-YYYY HH:mm",
      "sundayFirst" : false
    }
    let maxDate = moment(start).add(24, "hour");

    return(
      <div>
        <div className="col-6">
          <DateTimeRangeContainer
            ranges={ranges}
            start={this.state.start}
            end={this.state.end}
            local={local}
            maxDate={maxDate}
            applyCallback={this.applyCallback}
          >
            <FormControl
              onClick={this.pauseDispatch}
              id="formControlsTextB"
              type="text"
              label="Text"
              placeholder={moment(this.state.start).format("lll") + " - " + moment(this.state.end).format("lll")}
            />
          </DateTimeRangeContainer>
        </div>

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
