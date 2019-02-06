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
          </tbody>
        </Table>
      </div>
      <div className = "col-lg-6 col-sm-12">
        <Table striped>
          <tbody>
            <tr>
              <th>{"Range Limits  (°" + device.Parameters[0].Unit + ")"}</th>
              <td>
                <InlineEdit
                  value={device.Parameters[0].Range.LowerLimit}
                  tag="span"
                  type="text"
                  saveLabel="Update"
                  saveColor="#17a2b8"
                  cancelLabel="Cancel"
                  cancelColor="#6c757d"
                  onSave={value => props.update(props.parameter, "LowerLimit", value)}
                />
                <InlineEdit
                  value={device.Parameters[0].Range.UpperLimit}
                  tag="span"
                  type="text"
                  saveLabel="Update"
                  saveColor="#17a2b8"
                  cancelLabel="Cancel"
                  cancelColor="#6c757d"
                  onSave={value => props.update(props.parameter, "UpperLimit", value)}
                />
              </td>
            </tr>
            <tr>
              <th>Stability Criteria</th>
              <td>{"Window Size: " + device.Parameters[0].StabilityCriteria.WindowSize} <br/>  {" UpperLimit: " + device.Parameters[0].StabilityCriteria.UpperLimit}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{device.Parameters[0].Status}</td>
            </tr>
            <tr>
              <th>Stability Criteria</th>
              <td>{device.Parameters[0].StandardDeviation.toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const ParameterTable = (props) => {
  const parameter = props.data;
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
            <th>Time</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i}>
                <td>{new Date(item.TimeStamp).toLocaleTimeString("en-US")}</td>
                <td style = {{textAlign:"center", fontWeight: "bold"}}>{item.Value.toFixed(2)}</td>
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
        DeviceID: props.match.params.deviceID
    }

    this.props.dispatch(deviceActions.getSingleDeviceData(this.state.DeviceID));

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    const {device} = this.props;
    const {parameterData} = this.props;console.log(device)

    this.updateLimit = this.updateLimit.bind(this);
  }

  findTypeTemperature(parameter){
    return parameter.Type == "Temperature";
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

  updateLimit(parameter, range, value){
    let updateData = {
        'ParameterID': parameter,
        'Range': {}
    }
    updateData.Range[range] = value;
    this.props.dispatch(parameterActions.updateParameter(this.user.UserID, this.state.AssetID, updateData));
    toastr.success("Device range limits updated.");
  }

  render() {
    const { AssetID } = this.state;
    const { deviceData } = this.props;
    const { parameterData } = this.props;

    let tempParameter;
    if (deviceData){
      tempParameter = deviceData.Parameters.find(this.findTypeTemperature).ParameterID;
    }

    if(!this.props.parameterData && tempParameter){
      console.log(tempParameter)
      this.dispatchParameterContinuously = setInterval(() => {
        this.props.dispatch(dataActions.getSingleParameterData(tempParameter, Date.now()-600000, Date.now()));
      }, 5000);
    }

    if (!this.user)
    {
      return (<Redirect to = '/login' />);
    }
    else{
      return (
        <div className = "mt-3">
        {deviceData && parameterData ?
          <div>
            <DeviceInfo data={deviceData} update={this.updateLimit} parameter={tempParameter}/>

            <div className = "row mt-3">
              <div className = "col-auto">
                <h3>History</h3>
                <ParameterTable data={this.sortTime(parameterData)}/>
              </div>
              <div className = "col-sm-auto col-lg-8">
                <ParameterPlot/>
              </div>
            </div>
          </div>
        :
          <Loader/>
        }
      </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const { data } = state.device;
  const parameterdata = state.data.data;
  return {
      deviceData : data,
      parameterData: parameterdata
  };
}

const connectedPage = connect(mapStateToProps)(AssetDeviceDetail);
export { connectedPage as AssetDeviceDetail };
