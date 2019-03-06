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
    }

    handleOptionChange(event) {
      this.range.interval = event.target.value;
      console.log(this.range)
      localStorage.setItem('range', JSON.stringify(this.range));
      this.forceUpdate();
    }

    componentDidMount(){
      let rangeOptions = $(".rangecontainer");
      let liveDiv = $(".liveDiv");
      let timePicker = $(".fromDateTimeContainer");
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

      console.log(this.range.live)
      if(this.range.live==true){
        console.log('live')
        $(".fromDateTimeContainer").css("display","none");
        $(".daterangepicker:first").append(liveDiv);
        $(".liveDiv").css("display","block");
      } else{
        $( ".rangebuttontextstyle:first" ).removeClass( "myClass noClass" ).addClass( "yourClass" );
      }
    }

    applyCallback(start, end){
<<<<<<< HEAD
      var range = {
        live: false,
        interval: 30,
        start: this.range.start,
        end: this.range.end,
        polling: false
      };
      this.range = range;


      localStorage.setItem('range', JSON.stringify(range));

=======
      console.log(start)
      console.log(end)
      this.range.live = false;
      this.range.start = moment(start).format('X');
      this.range.end = moment(end).format('X');
      localStorage.setItem('range', JSON.stringify(this.range));
>>>>>>> 41092ae42255f5f7acb5e5a633525cab5ef749ba

      var m_res = matchRoutes(routes, window.location.pathname);
      var asset, tag, device;

      for(var item in m_res) {
        if (m_res[item].match.isExact) {
          asset = m_res[item].match.params.assetID;
          tag = m_res[item].match.params.tagID;
          device = m_res[item].match.params.deviceID;
        }
      }
      console.log(this.range);
      if (asset && device)
      {
<<<<<<< HEAD
        console.log("apply");
        console.log(this.range);
        this.props.dispatch(deviceActions.getSingleDeviceData(device, range.live, range.interval, range.start, range.end));
=======
        this.props.dispatch(deviceActions.getSingleDeviceData(device, this.range.live, this.range.interval, this.range.start, this.range.end));
>>>>>>> 41092ae42255f5f7acb5e5a633525cab5ef749ba
      } else if (asset && tag){
        this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')), asset, tag, this.range.start, this.range.end));
      } else {

      }

      this.forceUpdate();

    }

    handleLiveButtonApply(){
      this.range.live = true;
      localStorage.setItem('range', JSON.stringify(this.range));
      this.forceUpdate();
    }

    render() {
      console.log(this.range)
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
              {this.range.live==true?
                "Real-time Data in "+ this.range.interval:
                moment.unix(this.range.start).format("MMMM Do YYYY, H:mm") + " - " + moment.unix(this.range.end).format("MMMM Do YYYY, H:mm")

              }
              <i className="fas fa-angle-down ml-3"></i>
            </Button>


          </DateTimeRangeContainer>

          <div className='liveDiv p-3'>
            <div className='radio'> <label><input type='radio' value={10} checked={this.range.interval == 10} onChange={this.handleOptionChange}/>10 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={30} checked={this.range.interval == 30} onChange={this.handleOptionChange}/>30 Minutes</label> </div>
            <div className='radio'> <label><input type='radio' value={60} checked={this.range.interval == 60} onChange={this.handleOptionChange}/>1 Hour</label> </div>
            <div className='radio'> <label><input type='radio' value={300} checked={this.range.interval == 300} onChange={this.handleOptionChange}/>5 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={600} checked={this.range.interval == 600} onChange={this.handleOptionChange}/>10 Hours</label> </div>
            <div className='radio'> <label><input type='radio' value={1440} checked={this.range.interval == 1440} onChange={this.handleOptionChange}/>1 Day</label> </div>
            <Button onClick={this.handleLiveButtonApply} color="success" className="mt-2">Apply</Button>
          </div>
        </div>
      );
    }

}

export default RangePicker;
