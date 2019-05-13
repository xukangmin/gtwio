import React from 'react';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';
import { connect } from 'react-redux';

import { assetActions } from '../_actions/assetAction';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import 'antd/dist/antd.css';
import moment from 'moment';
import { BaselinePicker } from './BaselinePicker.js';
import { IntervalPicker } from './IntervalPicker.js';

class Pickers extends React.Component {
    constructor(props) {
      super(props);

      this.range = JSON.parse(localStorage.getItem('range'));
      this.user = JSON.parse(localStorage.getItem('user'));

      if (!this.range)
      {
        let now = new Date();
        let range = {
          live: true,
          interval: 10,
          start: moment(now).subtract(10, "minutes").format('X'),
          end: moment(now).format('X')
        };
        this.range = range;
        localStorage.setItem('range', JSON.stringify(range));
      }

      this.state = {
        pickerOption: this.range.live ? 'live' : 'history',
        interval: this.range.interval,
        start: this.range.start,
        end: this.range.end,
        rangeModalOpen: false
      };

      this.handleOptionChange = this.handleOptionChange.bind(this);
      this.handleIntervalChange = this.handleIntervalChange.bind(this);
      this.handleRangeChange = this.handleRangeChange.bind(this);
      this.updateRangeState = this.updateRangeState.bind(this);
      this.handlePickerApply = this.handlePickerApply.bind(this);
      this.applyPickerUpdate = this.applyPickerUpdate.bind(this);
      this.intervalToText = this.intervalToText.bind(this);
      this.rangeModalToggle = this.rangeModalToggle.bind(this);
    }

    rangeModalToggle(t){
      this.setState(prevState => ({
        rangeModalOpen: !prevState.rangeModalOpen
      }));
    }

    handleOptionChange(event){
      this.setState({
        pickerOption: event.target.value
      });
    }

    handleIntervalChange(event){
      this.setState({
        interval: event.target.value
      });
    }

    handleRangeChange(times){
      this.setState({
        start: moment(times[0]).format('X'),
        end: moment(times[1]).format('X'),
        rangeModalOpen: true
      });
      this.updateRangeState(times[0],times[1]);
    }

    updateRangeState(t1, t2){
      this.setState({
        start: t1.format('X'),
        end: t2.format('X')
      });
    }

    handlePickerApply(e){
      this.rangeModalToggle();

      if (e.target.name == "apply"){
        if (this.state.pickerOption == 'live'){
          this.range.live = true;
          this.range.start = this.range.start;
          this.range.end = this.range.end;
          this.range.interval = this.state.interval;
        }
        else {
          this.range.live = false;
          this.range.start = this.state.start;
          this.range.end = this.state.end;
        }
      } else if (e.target.name == "cancel"){
        this.setState({
          pickerOption: this.range.live ? "live" : "history",
          interval: this.range.interval,
          start: this.range.start,
          end: this.range.end
        });
      }
      this.applyPickerUpdate();
    }

    componentDidMount(){
      this.applyPickerUpdate();
    }
    
    applyPickerUpdate() {
      localStorage.setItem('range', JSON.stringify(this.range));

      let m_res = matchRoutes(routes, window.location.pathname);
      let asset, tag, device, parameter, flow;

      for(var item in m_res) {
        if (m_res[item].match.isExact) {
          asset = m_res[item].match.params.assetID;
          tag = m_res[item].match.params.tagID;
          device = m_res[item].match.params.deviceID;
          parameter = m_res[item].match.params.parameterID;
          flow = m_res[item].match.params.flowID;
        }
      }

      let liveDispatchInterval = 60*1000;
      if (asset) {
        this.props.dispatch(assetActions.getTimeRangeByAsset(asset));      
        this.props.dispatch(assetActions.getTimeIntervals(asset));
        // this.props.dispatch(assetActions.getAssetConfig(asset));
      }

      if (asset && device)
      {
        if (this.range.live){
          this.props.dispatch(deviceActions.getDevice(device, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(deviceActions.getDevice(device, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else {
            this.props.dispatch(deviceActions.getDevice(device, this.range.start*1000, this.range.end*1000));
        }
      }

      else if (asset && parameter)
      {
        this.props.dispatch(parameterActions.getParameter(parameter));
        setInterval(() => {
          this.props.dispatch(parameterActions.getParameter(parameter));
        }, liveDispatchInterval);

        if (this.range.live){
          this.props.dispatch(dataActions.getSingleParameterData(parameter, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(dataActions.getSingleParameterData(parameter, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else {
          this.props.dispatch(dataActions.getSingleParameterData(parameter, this.range.start*1000, this.range.end*1000));
        }        
      }

      else if (asset && flow)
      {
        if (this.range.live){
          this.props.dispatch(dataActions.getDataBySerialNumber(flow, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(dataActions.getDataBySerialNumber(flow, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else {
          this.props.dispatch(dataActions.getDataBySerialNumber(flow, this.range.start*1000, this.range.end*1000));
        }
      }

      else if (asset && tag){
        if (this.range.live){
          this.props.dispatch(dataActions.getSingleTagData(this.user, asset, tag, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(dataActions.getSingleTagData(this.user, asset, tag, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else {
          this.props.dispatch(dataActions.getSingleTagData(this.user, asset, tag, this.range.start*1000, this.range.end*1000));
        }
      }

      else if (asset && m_res[item].match.url.includes("dashboard")){
        if (this.range.live){
          this.props.dispatch(assetActions.getAsset(this.user, asset));
          setInterval(() => {
            this.props.dispatch(assetActions.getAsset(this.user, asset));
          }, liveDispatchInterval);
        } else{
          this.props.dispatch(assetActions.getAsset(this.user, asset));
        }
      }

      else if (asset && m_res[item].match.url.includes("data")){
        if (this.range.live){
          this.props.dispatch(dataActions.getDataByAssetID(asset, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(dataActions.getDataByAssetID(asset, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else{
          this.props.dispatch(dataActions.getDataByAssetID(asset, this.range.start*1000, this.range.end*1000));
        }
      }
    }

    render() {
      let intervalText = this.intervalToText(this.range.interval);

      return (
        <div style={{display: 'inline-block'}}>
          <Button id="timePicker" onClick={this.rangeModalToggle} className="btn-light mr-3" style={{border: "1px solid #d3d3d3"}}>
            <i className ="fas fa-calendar mr-2"></i>
            {this.range.live ?
              "Live Data:  " + intervalText + " from Now" :
              "History Data:  " + moment(parseInt(this.range.start)*1000).format('YYYY-MM-DD H:mm') + " ~ " + moment(parseInt(this.range.end)*1000).format('YYYY-MM-DD H:mm')
            }
            <i className="fas fa-angle-down ml-3"></i>
          </Button>          
          {this.props.assetData && this.props.assetTimeIntervals && this.props.assetTimeRange &&
            <div style={{display: 'inline-block'}}>
              <BaselinePicker data={this.props.assetData} range={this.props.assetTimeRange}/>
              <IntervalPicker asset={this.props.assetData} data={this.props.assetTimeIntervals} range={this.props.assetTimeRange}/>
            </div>
           
          }               
          <Modal isOpen={this.state.rangeModalOpen} toggle={this.rangeModalToggle} backdrop={false} style={{maxWidth: "450px"}}>
            <ModalHeader toggle={this.rangeModalToggle}>Data Time Range Setting</ModalHeader>
            <ModalBody>
            <div className="mb-1">
              <label className="mr-3"><input type="radio" name="rangeType" checked={this.state.pickerOption == 'live'} onChange={this.handleOptionChange} value="live"/> Live </label>
              <label><input type="radio" name="rangeType" checked={this.state.pickerOption == 'history'} onChange={this.handleOptionChange} value="history"/> History</label>
            </div>

            <Form style={{display: this.state.pickerOption == 'live' ? "block" : "none"}}>
              <Input type="select" value={this.state.interval} onChange={(e)=>this.handleIntervalChange(e)}  style={{width: "130px", display: "inline-block", borderRadius: "4px", border: "1px #d9d9d9 solid", marginRight: "15px", padding: "0 5"}}>
                <option value={10}>10 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hours</option>
                <option value={300}>5 Hours</option>
                <option value={600}>10 Hour</option>
                <option value={1440}>1 Day</option>
                <option value={10080}>1 Week</option>
                <option value={302400}>30 Days</option>
              </Input>
              <label>from Now</label>
            </Form>

            <Form style={{display: this.state.pickerOption == 'history' ? "block" : "none"}}>
              <div>
                <RangePicker
                  size="large"
                  showTime={{ format: 'HH:mm' }}
                  defaultValue={[moment.unix(this.range.start), moment.unix(this.range.end)]}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={['Start Time', 'End Time']}
                  ranges={{ Today: [moment().startOf('day'), moment().endOf('day')], Yesterday: [moment().subtract(1, "days").startOf('day'), moment().subtract(1, "days").endOf('day')], 'This Month': [moment().startOf('month'), moment().endOf('month')] }}
                  onChange={(t)=>this.handleRangeChange(t)}
                />
              </div>
            </Form>
            </ModalBody>
            <ModalFooter>
              <Button name="apply" color="primary" onClick={e=>this.handlePickerApply(e)}>Apply</Button>
              <Button name="cancel" onClick={this.handlePickerApply}>Cancel</Button>
            </ModalFooter>
          </Modal>

          
        </div>
      );
    }

    intervalToText(interval){
      let rangeText = interval;
      switch(rangeText.toString()){
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
}

function mapStateToProps(state) {
  const { data } = state.asset;
  return {
    assetData: data,
    assetTimeRange: state.asset.timeRange,
    assetTimeIntervals: state.asset.timeIntervals
  };
}

const connectedPage = connect(mapStateToProps)(Pickers);
export { connectedPage as Pickers };
