import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { dataActions } from '../_actions/dataAction'
import { deviceActions } from '../_actions/deviceAction'
import { parameterActions } from '../_actions/parameterAction'
import './asset.css'
import Loader from '../_components/loader'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'
import { Table } from 'reactstrap';
import { ParameterPlot } from '../AssetPage/dashboard_parts/widget_parts/ParameterPlot';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import EditableLabel from 'react-inline-edition';

const DeviceInfo = (props) => {
  const device = props.data;

  return(
    <div className = "row">
      <div className="col-12">
        <h3>{device.DisplayName}</h3>
      </div>
      <div className = "col-lg-6 col-sm-12">
        <Table striped>
          <tbody>
            <tr>
              <th>Device ID</th>
              <td>{device.DeviceID}</td>
            </tr>
            <tr>
              <th>Serial Number</th>
              <td>{device.SerialNumber}</td>
            </tr>
            <tr>
              <th>Last Calibration Date</th>
              <td>{device.LastCalibrationDate.slice(0,10)}</td>
            </tr>
            {device.Parameters[0].CurrentValue &&
            <tr>
              <th>Current Value</th>
              <td>{device.Parameters[0].CurrentValue.toFixed(2) + ' °' + device.Parameters[0].Unit}</td>
            </tr>
            }
            {device.Parameters[0].CurrentTimeStamp &&
            <tr>
              <th>Current Time Stamp</th>
              <td>{new Date(Number(device.Parameters[0].CurrentTimeStamp)).toLocaleString()}</td>
            </tr>
            }
          </tbody>
        </Table>
      </div>
      <div className = "col-lg-6 col-sm-12">
        <Table striped>
          <tbody>
            <tr>
              <th>Lower Alarm Limit</th>
              <td>
                <InlineEdit
                  value={device.Parameters[0].Range.LowerLimit + ' °' + device.Parameters[0].Unit}
                  tag="span"
                  type="text"
                  saveLabel="Update"
                  saveColor="#17a2b8"
                  cancelLabel="Cancel"
                  cancelColor="#6c757d"
                  onSave={value => props.update(props.parameter, device.Parameters[0].Range, "LowerLimit", value)}
                />
              </td>
            </tr>
            <tr>
              <th>Upper Alarm Limit</th>
              <td>
                <InlineEdit
                  value={device.Parameters[0].Range.UpperLimit + ' °' + device.Parameters[0].Unit}
                  tag="span"
                  type="text"
                  saveLabel="Update"
                  saveColor="#17a2b8"
                  cancelLabel="Cancel"
                  cancelColor="#6c757d"
                  onSave={value => props.update(props.parameter, device.Parameters[0].Range, "UpperLimit", value)}
                />
              </td>
            </tr>
            <tr>
              <th>Stability Criteria - Window Size</th>
              <td>{device.Parameters[0].StabilityCriteria.WindowSize + ' minutes'}</td>
            </tr>
            <tr>
              <th>Stability Criteria - Upper Threshold</th>
              <td>{device.Parameters[0].StabilityCriteria.UpperLimit + ' °' + device.Parameters[0].Unit}</td>
            </tr>
            <tr>
              <th>Stability</th>
              <td>{device.Parameters[0].StandardDeviation.toFixed(2) + ' °' + device.Parameters[0].Unit + '/hr'}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{device.Parameters[0].Status}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const ParameterTable = (props) => {
  const parameter = props.data;
  const device = props.device;
  return(
    <div>
      <Table
        style={{
          display: "block",
          height: "50vh",
          overflowY: "scroll"
        }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i}>
                <td>{new Date(item.TimeStamp).toLocaleString()}</td>
                <td style = {{textAlign:"center", fontWeight: "bold"}}>{item.Value.toFixed(2) + ' °' + device.Parameters[0].Unit}</td>
              </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

class AssetDeviceDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        AssetID : props.match.params.assetID,
        DeviceID: props.match.params.deviceID,
    }

    this.range = JSON.parse(localStorage.getItem('range'));
    console.log(this.range);
    this.props.dispatch(deviceActions.getSingleDeviceData(this.state.DeviceID, this.range.live, this.range.interval, this.range.start, this.range.end));

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.updateLimit = this.updateLimit.bind(this);
  }

  componentDidMount() {
    this.dispatchParameterContinuously = setInterval(() => {
      this.range = JSON.parse(localStorage.getItem('range'));
      console.log(this.range);
      if (this.range.polling)
      {
        this.props.dispatch(deviceActions.getSingleDeviceData(this.state.DeviceID, this.range.live, this.range.interval, this.range.start, this.range.end));
      }
    }, 60000);
  }

  sortTime(data){
    return(data.sort(
      function(a,b){
        var TimeA = a.TimeStamp;
        var TimeB = b.TimeStamp;
        if (TimeA > TimeB) {
          return -1;
        }
        if (TimeA < TimeB) {
          return 1;
        }
        return 0;
      }
    ))
  }

  updateLimit(parameter, currentValue, range, value){
    var num_in = Number(value);

    if (!isNaN(num_in))
    {
      if (range == 'UpperLimit') {
        var lower = currentValue.LowerLimit;

        if (num_in <= lower) {
          toastr.warning("Upper limit cannot be smaller than lower limit");
        } else {
          let updateData = {
              'ParameterID': parameter,
              'Range': currentValue
          }
          updateData.Range[range] = num_in;
          this.props.dispatch(parameterActions.updateParameter(this.user.UserID, this.state.AssetID, updateData));
          toastr.success("Device range limits updated.");
        }

      } else if (range == 'LowerLimit') {
        var upper = currentValue.UpperLimit;

        if (num_in >= upper) {
          toastr.warning("Lower limit cannot larger than upper limit");
        } else {
          let updateData = {
              'ParameterID': parameter,
              'Range': currentValue
          }
          updateData.Range[range] = num_in;
          this.props.dispatch(parameterActions.updateParameter(this.user.UserID, this.state.AssetID, updateData));
          toastr.success("Device range limits updated.");
        }
      }
    } else {
      toastr.warning("Please Enter Number Only");
    }
  }

  render() {
    const { AssetID } = this.state;
    const { deviceData, pollEnable } = this.props;
    const { parameterData } = this.props;

    if (!this.user)
    {
      return (<Redirect to = '/login' />);
    } else {
      return (
        <div className = "mt-3">
        {deviceData ?
          <div>
            <DeviceInfo data={deviceData} update={this.updateLimit} parameter={deviceData.Parameters.ParameterID}/>
            {parameterData &&
              <div className = "row mt-3">
                <div className = "col-auto">
                  <h4>Table View</h4>
                  <ParameterTable data={this.sortTime(parameterData)} device={deviceData}/>
                </div>
                <div className = "col-sm-auto col-lg-8">
                  <ParameterPlot />
                </div>
              </div>
            }
          </div> :
          <Loader/>
        }
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const { data, pollEnable } = state.device;
  const parameterdata = state.data.data;
  return {
      deviceData : data,
      parameterData: parameterdata,
      pollEnable: pollEnable
  };
}

const connectedPage = connect(mapStateToProps)(AssetDeviceDetail);
export { connectedPage as AssetDeviceDetail };
