import React from 'react';
import Link from 'react-router-dom/Link';
import Route from 'react-router-dom/Route';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
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

      let now = new Date();
      let start = moment(now).subtract(10, "minutes");
      let end = moment(now);

      this.state = {
        pulling: true,
        live: true,
        start: start,
        end: end,
        interval: 10*60*1000
      }

      this.range = JSON.parse(localStorage.getItem('range'));

      if (!this.range)
      {
         var range = {
           live: true,
           interval: 30,
           start: 0,
           end: 0,
           polling: true
         };
         this.range = range;
         localStorage.setItem('range', JSON.stringify(range));
      }

      this.applyCallback = this.applyCallback.bind(this);

  //    this.dispatchTagContinuously = setInterval(() => {

 //          this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, this.state.realtime_start, this.state.realtime_end));

//      }, 60000);
    }

    componentDidMount(){
      $(".inputDate").css("textAlign","center");
      $( ".rangecontainer:first-child" ).click(function(){
        // $(".fromDateTimeContainer").css("display","none");
        // $(".daterangepicker").append(
        //   "<div><div className='radio'><label><input type='radio' value='option1'/>10 Min</label></div><div className='radio'><label><input type='radio' value='option2'/>30 Min</label></div></div>")
      });
    }

    applyCallback(start, end){
      this.setState({
          start: start,
          end: end
        },
        () => {
          var m_res = matchRoutes(routes, window.location.pathname);
          var asset, tag, device;

          for(var item in m_res) {
            if (m_res[item].match.isExact) {
              asset = m_res[item].match.params.assetID;
              tag = m_res[item].match.params.tagID;
              device = m_rest[item].match.params.deviceID;
            }
          }
          var range = {
            live: false,
            interval: 30,
            start: this.state.start,
            end: this.state.end,
            polling: false
          };
          localStorage.setItem('range', JSON.stringify(range));

          if (asset && device)
          {
            console.log("apply");
            this.props.dispatch(deviceActions.getSingleDeviceData(device, range.live, range.interval, range.start, range.end));
          } else if (asset && tag){
            this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),asset, tag, this.state.start, this.state.end));
          } else {

          }


        }
      );
    }



    render() {
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
            start={this.state.start}
            end={this.state.end}
            local={local}
            maxDate={maxDate}
            applyCallback={this.applyCallback}
          >
            <FormControl
              id="formControlsTextB"
              type="text"
              label="Text"
              placeholder={moment(this.state.start).format("lll") + " - " + moment(this.state.end).format("lll")}
              style={{display: "none"}}
            />
            <Button className="my-1">
              <i className ="fas fa-calendar mr-3"></i>
              {moment(this.state.start).format("MMMM Do YYYY, H:mm") + " - " + moment(this.state.end).format("MMMM Do YYYY, H:mm")}
              <i className="fas fa-angle-down ml-3"></i>
            </Button>
          </DateTimeRangeContainer>
        </div>
      );
    }

}

export default RangePicker;
