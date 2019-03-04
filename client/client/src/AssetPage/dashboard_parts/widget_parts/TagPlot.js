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

    let now = new Date();
    let start = moment(now).subtract(10, "minutes");
    let end = moment(now);

    this.state = {
        start : start,
        end : end,
        plot_Interval: 10,
        continue_Dispatch: true,
        interval_Updated: false,
        selectedOption: 'option1'
    }

    this.applyCallback = this.applyCallback.bind(this);
    this.pauseDispatch = this.pauseDispatch.bind(this);
    this.plotUpdated = this.plotUpdated.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);

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

  handleOptionChange(event) {
    this.setState({
      selectedOption: event.target.value
    });
  }

  render(){
    const { DeviceData } = this.props;
    console.log(DeviceData);

    let formattedData = [];
    let allData = [];

    for (var i = 0; i < DeviceData.length; i++){
      formattedData.push({
        x: DeviceData[i].Data.map((item,i) => new Date(item.TimeStamp).toLocaleTimeString("en-US")),
        y: DeviceData[i].Data.map((item,i) => item.Value),
        type: 'scatter',
        name: DeviceData[i].SerialNumber
      })
      allData.push(DeviceData[i].Data.map((item,i) => item.Value));
    }

    let layout = {
      yaxis: {
        range: [Math.min(...allData[0])-10,Math.max(...allData[0])+10],
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
        <form>
          <div className="radio" style={{display: 'inline'}}>
            <label>
              <input type="radio" value="option1" checked={this.state.selectedOption === 'option1'} onChange={this.handleOptionChange}/>
              {' '}Real Time Data
            </label>
          </div>
          <div className="radio" style={{display: 'inline', marginLeft: '15px'}}>
            <label>
              <input type="radio" value="option2" checked={this.state.selectedOption === 'option2'} onChange={this.handleOptionChange}/>
              {' '}Custom Time Range
            </label>
          </div>
        </form>
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
              style={{display: this.state.selectedOption === 'option1' ? "none" : "block"}}
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
