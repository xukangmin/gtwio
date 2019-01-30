import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { dataActions } from '../_actions/dataAction'
import { deviceActions } from '../_actions/deviceAction'
import './asset.css'
import Loader from '../_components/loader'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'
import { Table } from 'reactstrap';
import { ParameterPlot } from '../AssetPage/dashboard_parts/widget_parts/ParameterPlot';

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
    // data will update every 1 minute on this page'
    // this.findTypeTemperature = this.findTypeTemperature.bind(this);
  }

  findTypeTemperature(parameter){
    return parameter.Type == "Temperature";
  }

  render() {
    const { AssetID } = this.state;
    const { deviceData } = this.props;
    const { parameterData } = this.props;
    let tempParameter;

    if(deviceData){
      tempParameter = deviceData.Parameters.find(this.findTypeTemperature).ParameterID;
    }

    if(!this.props.parameterData && tempParameter){
      this.props.dispatch(dataActions.getSingleParameterData(tempParameter, Date.now()-600000, Date.now()));
    }

    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (

        <div className="mt-3">
        {deviceData && parameterData?
          <div>
            <div className="row">
              <div className="col-6">
                <h3>{deviceData.DisplayName}</h3>
                <Table striped>
                  <tbody>
                    <tr>
                      <th scope="row">Device ID</th>
                      <td>{deviceData.DeviceID}</td>
                    </tr>
                    <tr>
                      <th scope="row">Serial Number</th>
                      <td>{deviceData.SerialNumber}</td>
                    </tr>
                    <tr>
                      <th scope="row">Last Calibration Date</th>
                      <td>{deviceData.LastCalibrationDate}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="row mt-3">
                <div className="col-xl-2 col-sm-6">
                <h3>History</h3>
                <Table striped>
                  <tbody>
                    {parameterData.map((item,i) =>
                          <tr key={i}>
                            <th scope="row">{new Date(item.TimeStamp).toLocaleTimeString("en-US")}</th>
                            <td>{item.Value.toFixed(2)}</td>
                          </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="col-10">
                <ParameterPlot data={parameterData}/>
              </div>
            </div>
          </div>
        :<Loader/>}
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
