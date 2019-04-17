import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { parameterActions } from '../../../_actions/parameterAction';
import { Table } from 'reactstrap';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';

import Loader from '../../../Widgets/Loader';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';

const DeviceInfo = (props) => {
  const device = props.data;
  return(
    <div className = "row">
      <div className="col-12">
        <h4>{device.DisplayName}</h4>
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
              <td>{moment(device.LastCalibrationDate).format('MMMM Do YYYY')}</td>
            </tr>
            {device.Parameters[0].CurrentValue &&
            <tr>
              <th>Current Value</th>
              <td>{device.Parameters[0].CurrentValue.toFixed(2) + ' ' + device.Parameters[0].Unit}</td>
            </tr>
            }
            {device.Parameters[0].CurrentTimeStamp &&
            <tr>
              <th>Current Time Stamp</th>
              <td>{moment(new Date(Number(device.Parameters[0].CurrentTimeStamp))).format('MMMM Do YYYY, H:mm')}</td>
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
                <div style={{display: "flex"}}>
                  <InlineEdit
                    value={device.Parameters[0].Range.LowerLimit}
                    tag="span"
                    type="text"
                    saveLabel="Update"
                    saveColor="#17a2b8"
                    cancelLabel="Cancel"
                    cancelColor="#6c757d"
                    onSave={value => props.update(device.Parameters[0].ParameterID, device.Parameters[0].Range, "LowerLimit", value)}
                  />
                  <span>{device.Parameters[0].Unit}</span>
                </div>                
              </td>
            </tr>
            <tr>
              <th>Upper Alarm Limit</th>
              <td>
                <div style={{display: "flex"}}>
                  <InlineEdit
                    value={device.Parameters[0].Range.UpperLimit}
                    tag="span"
                    type="text"
                    saveLabel="Update"
                    saveColor="#17a2b8"
                    cancelLabel="Cancel"
                    cancelColor="#6c757d"
                    onSave={value => props.update(device.Parameters[0].ParameterID, device.Parameters[0].Range, "UpperLimit", value)}
                  />
                  {device.Parameters[0].Unit}
                </div>
              </td>
            </tr>
            <tr>
              <th>Stability Criteria - Window Size</th>
              <td>
                <div style={{display: "flex"}}>
                  <InlineEdit
                    value={device.Parameters[0].StabilityCriteria.WindowSize}
                    tag="span"
                    type="text"
                    saveLabel="Update"
                    saveColor="#17a2b8"
                    cancelLabel="Cancel"
                    cancelColor="#6c757d"
                    onSave={value => props.updateStability(device.Parameters[0].ParameterID, "WindowSize", value, device.Parameters[0].StabilityCriteria)}
                  />
                  {" minutes"}
                </div>
              </td>
            </tr>
            <tr>
              <th>Stability Criteria - Upper Threshold</th>
              <td>
                <div style={{display: "flex"}}>
                  <InlineEdit
                    value={device.Parameters[0].StabilityCriteria.UpperLimit}
                    tag="span"
                    type="text"
                    saveLabel="Update"
                    saveColor="#17a2b8"
                    cancelLabel="Cancel"
                    cancelColor="#6c757d"
                    onSave={value => props.updateStability(device.Parameters[0].ParameterID, "UpperLimit", value, device.Parameters[0].StabilityCriteria)}
                  />
                  {device.Parameters[0].Unit}
                </div>
              </td>
            </tr>
            <tr>
              <th>Stability</th>
              <td>{device.Parameters[0].StandardDeviation.toFixed(2) + ' ' + device.Parameters[0].Unit + '/hr'}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td style={{color: device.Parameters[0].Status == "Valid" ? "green" : "red", fontWeight: "bold"}}>{device.Parameters[0].Status}</td>
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
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i} >
                <td style = {{padding:0}}>{moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
                <td style = {{textAlign:"center", fontWeight: "bold", padding: 0}}>{item.Value.toFixed(2) + device.Parameters[0].Unit}</td>
              </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

class Device extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        AssetID : props.match.params.assetID,
        DeviceID: props.match.params.deviceID,
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.updateLimit = this.updateLimit.bind(this);
    this.updateStability = this.updateStability.bind(this);
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
    var num_in = Number(value.value);

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
          this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, updateData));
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
          this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, updateData));
        }
      }
    } else {
      toastr.warning("Please Enter Number Only");
    }
  }

  updateStability(parameter, type, value, stabilityObj){
    let updateData = {
        'ParameterID': parameter,
        'StabilityCriteria': stabilityObj
    }
    updateData.StabilityCriteria[type] = Number(value.value);
    this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, updateData));
  }

  render() {
    const { AssetID } = this.state;
    const { deviceData } = this.props;
    const { parameterData } = this.props;
    if (!this.user) {
      return (<Redirect to = '/login' />);
    } else {
      return (
        <div className = "mt-3">
        {deviceData ?
          <div>
            <DeviceInfo data={deviceData} update={this.updateLimit} updateStability={this.updateStability}/>
            {parameterData &&
              <div className = "row mt-3">
                <div className = "col-auto">
                  <h6>History</h6>
                  <ParameterTable data={this.sortTime(parameterData)} device={deviceData}/>
                </div>
                <div className = "col-sm-auto col-lg-8">
                  <SingleLinePlot parameterData={this.sortTime(parameterData)}/>
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
  const parameterData = state.data.data;
  return {
      deviceData : data,
      parameterData: parameterData,
      pollEnable: pollEnable
  };
}

const connectedPage = connect(mapStateToProps)(Device);
export { connectedPage as Device };
