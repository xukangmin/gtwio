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
import moment from 'moment';
import $ from 'jquery';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';

class RangePicker extends React.Component {
    constructor(props) {
      super(props);

      this.range = JSON.parse(localStorage.getItem('range'));
      this.user = JSON.parse(localStorage.getItem('user'));
      this.state = {
        display: 'block'
      }

      if (!this.range)
      {
        let now = new Date();
        let range = {
         live: true,
         interval: 10,
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
      this.updateLocalStorageAndTriggers = this.updateLocalStorageAndTriggers.bind(this);
      this.intervalToText = this.intervalToText.bind(this);
    }

    updateLocalStorageAndTriggers() {
      localStorage.setItem('range', JSON.stringify(this.range));

      var m_res = matchRoutes(routes, window.location.pathname);
      var asset, tag, device;
      console.log(m_res)
      for(var item in m_res) {
        if (m_res[item].match.isExact) {
          asset = m_res[item].match.params.assetID;
          tag = m_res[item].match.params.tagID;
          device = m_res[item].match.params.deviceID;
        }
        if (m_res[item].match.url.includes("configurations") || m_res[item].match.url.includes("devices")){
          this.setState({display: 'none'});
        }
      }

      var now = new Date().getTime();
      var liveStart = now-this.range.interval*60*1000;

      if (asset && device)
      {
        this.props.dispatch(deviceActions.getSingleDeviceData(device, this.range.live, this.range.interval, this.range.start*1000, this.range.end*1000));
      } else if (asset && tag){
        if (this.range.live){
          this.props.dispatch(dataActions.getSingleTagData(this.user, asset, tag, liveStart, now));
        } else {
          this.props.dispatch(dataActions.getSingleTagData(this.user, asset, tag, this.range.start*1000, this.range.end*1000));
        }
      } else if (asset){
        if (this.range.live){
          this.props.dispatch(dataActions.getDataByAssetID(asset, liveStart, now));
        } else{
          this.props.dispatch(dataActions.getDataByAssetID(asset, this.range.start*1000, this.range.end*1000));
        }
      }
    }

    handleOptionChange(event) {
      this.range.interval = event.target.value;
      this.forceUpdate();
    }

    componentDidMount(){
      let rangeOptions = $(".rangecontainer");
      let rangeInput = $(".daterangepicker:first");
      let liveDiv = $(".liveDiv");
      let timePicker = $(".fromDateTimeContainer");
      liveDiv.css("display","none");
      $(".inputDate").css("textAlign","center");

      if(this.range.live){
        timePicker.css("display","none");
        rangeInput.append(liveDiv);
        liveDiv.css("display","block");
      }

      $(".rangebuttontextstyle:first").click(function(){
        timePicker.css("display","none");
        rangeInput.append(liveDiv);
        liveDiv.css("display","block");
      });

      $(".rangebuttontextstyle:not(:first)" ).click(function(){
        timePicker.css("display","block");
        liveDiv.css("display","none");
      });

      this.updateLocalStorageAndTriggers();
    }

    applyCallback(start, end){
      this.range.live = false;
      this.range.start = moment(start).format('X');
      this.range.end = moment(end).format('X');
      this.range.polling = false;

      this.updateLocalStorageAndTriggers();
      this.forceUpdate();
    }

    handleLiveButtonApply(){
      $("#reactbody").click();
      this.range.live = true;

      this.updateLocalStorageAndTriggers();
      this.forceUpdate();
    }

    intervalToText(interval){
      let rangeText;
      interval.toString();
      switch(interval){
        case "10":
          rangeText = "10 Minutes";
          break;
        case "30":
          rangeText = "30 Minutes";
          break;
        case "60":
          rangeText = "1 Hour";
          break;
        case "300":
          rangeText = "5 Hours";
          break;
        case "600":
          rangeText = "10 Hours";
          break;
        case "1440":
          rangeText = "1 Day";
          break;
        case "10080":
          rangeText = "1 Week";
          break;
        case "302400":
          rangeText = "30 Days";
          break;
      }
      return rangeText;
    }

    render() {
      let now = new Date();
      let start = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0));
      let end = moment(start).add(1, "days").subtract(1, "seconds");
      let ranges = {
        "Real-time Data": [moment(start), moment(end)],
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
        <div style={{marginLeft: "-15px", display: this.state.display}} >
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
              {this.range.live?
                "Real-time Data: "+ this.intervalToText(JSON.parse(localStorage.getItem('range')).interval.toString()) + " from Now":
                moment.unix(this.range.start).format("MMMM Do YYYY, H:mm") + " - " + moment.unix(this.range.end).format("MMMM Do YYYY, H:mm")
              }
              <i className="fas fa-angle-down ml-3"></i>
            </Button>
          </DateTimeRangeContainer>

          <div className='liveDiv p-3'>
            <div className='radio'> <label><input type='radio' value={10} checked={this.range.interval == 10} onChange={this.handleOptionChange}/>{" "}10 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={30} checked={this.range.interval == 30} onChange={this.handleOptionChange}/>{" "}30 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={60} checked={this.range.interval == 60} onChange={this.handleOptionChange}/>{" "}1 Hour</label> </div>
            <div className='radio'> <label><input type='radio' value={300} checked={this.range.interval == 300} onChange={this.handleOptionChange}/>{" "}5 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={600} checked={this.range.interval == 600} onChange={this.handleOptionChange}/>{" "}10 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={1440} checked={this.range.interval == 1440} onChange={this.handleOptionChange}/>{" "}1 Day</label> </div>
            <div className='radio'> <label><input type='radio' value={10080} checked={this.range.interval == 10080} onChange={this.handleOptionChange}/>{" "}1 Week</label> </div>
            <div className='radio'> <label><input type='radio' value={302400} checked={this.range.interval == 302400} onChange={this.handleOptionChange}/>{" "}30 Days</label> </div>
            <Button id="DateRangePickerButton" onClick={this.handleLiveButtonApply} color="success" className="mt-2">Apply</Button>
          </div>
        </div>
      );
    }
}

export default RangePicker;
