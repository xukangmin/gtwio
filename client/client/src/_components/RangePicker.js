import React from 'react';
import Link from 'react-router-dom/Link';
import Route from 'react-router-dom/Route';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { FormControl, Button } from 'react-bootstrap';
import DateTimeRangeContainer from 'react-advanced-datetimerange-picker';
import moment from "moment";

import $ from 'jquery';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';

class RangePicker extends React.Component {
    constructor(props) {
      super(props);

      this.range = JSON.parse(localStorage.getItem('range'));
      let now = new Date();
      if (!this.range)
      {
         var range = {
           live: true,
           interval: 30,
           start: moment(now).subtract(10, "minutes"),
           end: moment(now),
           polling: true
         };
         this.range = range;
         localStorage.setItem('range', JSON.stringify(range));
      }

      this.applyCallback = this.applyCallback.bind(this);
      this.handleOptionChange = this.handleOptionChange.bind(this);
      this.handleLiveButtonApply = this.handleLiveButtonApply.bind(this);

    }

    handleOptionChange(event) {
      console.log(event.target.value)
      this.setState({
        LiveSelectedOption: event.target.value
      });
    }

    componentDidMount(){
      const rangeOptions = $(".rangecontainer");
      const liveDiv = $(".liveDiv");
      const timePicker = $(".fromDateTimeContainer");
      $(".liveDiv").css("display","none");
      $(".inputDate").css("textAlign","center");

      $( ".rangebuttontextstyle:first" ).click(function(){
        $(".fromDateTimeContainer").css("display","none");
        $(".daterangepicker:first").append(liveDiv);
        $(".liveDiv").css("display","block");
      });
      $( ".rangebuttontextstyle:not(:first)" ).click(function(){
        $(".fromDateTimeContainer").css("display","block");
        $(".liveDiv").css("display","none");
      });
    }

    applyCallback(start, end){
      var range = {
        live: true,
        interval: 30,
        start: this.range.start,
        end: this.range.end,
        polling: true
      };
      this.range = range;


      localStorage.setItem('range', JSON.stringify(range));


      var m_res = matchRoutes(routes, window.location.pathname);
      var asset, tag, device;

      for(var item in m_res) {
        if (m_res[item].match.isExact) {
          asset = m_res[item].match.params.assetID;
          tag = m_res[item].match.params.tagID;
          device = m_res[item].match.params.deviceID;
        }
      }

      if (asset && device)
      {
        console.log("apply");
        this.props.dispatch(deviceActions.getSingleDeviceData(device, range.live, range.interval, range.start, range.end));
      } else if (asset && tag){
        this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),asset, tag, range.start, range.end));
      } else {

      }
    }

    handleLiveButtonApply(){

    }

    render() {
      console.log(this.range)
      let now = new Date();
      let start = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0));
      let end = moment(start).add(1, "days").subtract(1, "seconds");
      let ranges = {
        "Live": [moment(start), moment(end)],
        "Today Only": [moment(start), moment(end)],
        "Yesterday Only": [moment(start).subtract(1, "days"), moment(end).subtract(1, "days")],
        "3 Days": [moment(start).subtract(3, "days"), moment(end)]
      }
      let local = {
        "format":"MM-DD-YYYY HH:mm",
        "sundayFirst" : false
      }
      let maxDate = moment(start).add(24, "hour");


      return (
        <div style={{marginLeft: "-15px"}}>
          <DateTimeRangeContainer
            ranges={ranges}
            start={start}
            end={end}
            local={local}
            maxDate={maxDate}
            applyCallback={this.applyCallback}
          >
            <FormControl
              id="formControlsTextB"
              type="text"
              label="Text"
              style={{display: "none"}}
            />
            <Button className="my-1">
              <i className ="fas fa-calendar mr-3"></i>
              {moment(this.range.start).format("MMMM Do YYYY, H:mm") + " - " + moment(this.range.end).format("MMMM Do YYYY, H:mm")}
              <i className="fas fa-angle-down ml-3"></i>
            </Button>


          </DateTimeRangeContainer>

          <div className='liveDiv p-3'>
            <div className='radio'> <label><input type='radio' value={600} checked={this.range.interval == 600} onChange={this.handleOptionChange}/>10 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={1800} checked={this.range.interval == 1800} onChange={this.handleOptionChange}/>30 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={3600} checked={this.range.interval == 3600} onChange={this.handleOptionChange}/>1 Hour</label> </div>
            <div className='radio'> <label><input type='radio' value={18000} checked={this.range.interval == 18000} onChange={this.handleOptionChange}/>5 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={36000} checked={this.range.interval == 36000} onChange={this.handleOptionChange}/>10 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={86400} checked={this.range.interval == 86400} onChange={this.handleOptionChange}/>1 Day</label> </div>
            <Button onClick={this.handleLiveButtonApply} color="success" className="mt-2">Apply</Button>
          </div>
        </div>
      );
    }

}

export default RangePicker;
