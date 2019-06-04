import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { parameterActions } from '../../../_actions/parameterAction';
import { Row, Table } from 'reactstrap';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';
import { DeviceParameter } from '../Device/DeviceParameter';

import Loader from '../../../Widgets/Loader';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import EmptyData from '../../../Widgets/EmptyData';

import { Tabs } from 'antd';
import 'antd/dist/antd.css';
const TabPane = Tabs.TabPane;

const DeviceInfo = (props) => {
  const device = props.data;

  return (
    <div>
      <Row>
        <div className="col-12">
          <h4>{device.DisplayName}</h4>
        </div>
      </Row>
      <Row>
        <div className="col-12">
        <Tabs >
          {device.Parameters.map((x, i) =>
            <TabPane
              tab={x.DisplayName}
              key={i}
            >
              <Row>
                <div className="col-lg-6 col-sm-12">
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
                      {x.CurrentValue &&
                        <tr>
                          <th>Current Value</th>
                          <td>{x.CurrentValue.toFixed(2) + ' ' + x.Unit}</td>
                        </tr>
                      }
                      {x.CurrentTimeStamp &&
                        <tr>
                          <th>Current Time Stamp</th>
                          <td>{moment(new Date(Number(x.CurrentTimeStamp))).format('MMMM Do YYYY, H:mm')}</td>
                        </tr>
                      }
                    </tbody>
                  </Table>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <Table striped>
                    <tbody>
                      <tr>
                        <th>Lower Alarm Limit</th>
                        <td>
                          <div style={{ display: "flex" }}>
                            <InlineEdit
                              value={x.Range.LowerLimit}
                              tag="span"
                              type="text"
                              saveLabel="Update"
                              saveColor="#17a2b8"
                              cancelLabel="Cancel"
                              cancelColor="#6c757d"
                              onSave={value => props.update(x.ParameterID, x.Range, "LowerLimit", Number(value))}
                            />
                            <span>{x.Unit}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Upper Alarm Limit</th>
                        <td>
                          <div style={{ display: "flex" }}>
                            <InlineEdit
                              value={x.Range.UpperLimit}
                              tag="span"
                              type="text"
                              saveLabel="Update"
                              saveColor="#17a2b8"
                              cancelLabel="Cancel"
                              cancelColor="#6c757d"
                              onSave={value => props.update(x.ParameterID, x.Range, "UpperLimit", Number(value))}
                            />
                            {x.Unit}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Stability Criteria - Window Size</th>
                        <td>
                          <div style={{ display: "flex" }}>
                            <InlineEdit
                              value={x.StabilityCriteria.WindowSize}
                              tag="span"
                              type="text"
                              saveLabel="Update"
                              saveColor="#17a2b8"
                              cancelLabel="Cancel"
                              cancelColor="#6c757d"
                              onSave={value => props.updateStability(x.ParameterID, "WindowSize", value, x.StabilityCriteria)}
                            />
                            {" minutes"}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Stability Criteria - Upper Threshold</th>
                        <td>
                          <div style={{ display: "flex" }}>
                            <InlineEdit
                              value={x.StabilityCriteria.UpperLimit}
                              tag="span"
                              type="text"
                              saveLabel="Update"
                              saveColor="#17a2b8"
                              cancelLabel="Cancel"
                              cancelColor="#6c757d"
                              onSave={value => props.updateStability(x.ParameterID, "UpperLimit", value, x.StabilityCriteria)}
                            />
                            {x.Unit}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Stability</th>
                        <td>{x.StandardDeviation.toFixed(2) + ' ' + x.Unit + '/hr'}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td style={{ color: x.Status == "Valid" ? "green" : "red", fontWeight: "bold" }}>{x.Status}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Row>
              <div className="col-12">
                <DeviceParameter data={device} />
              </div>
            </TabPane>
          )}
        </Tabs>
        </div>
      </Row>
    </div>
  );
};

class Device extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      AssetID: props.match.params.assetID,
      DeviceID: props.match.params.deviceID,
      activePara: undefined
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.updateLimit = this.updateLimit.bind(this);
    this.updateStability = this.updateStability.bind(this);
  }



  sortTime(data) {
    return (data.sort(
      function (a, b) {
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

  updateLimit(parameter, currentValue, range, value) {
    var num_in = Number(value);

    if (!isNaN(num_in)) {
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

  updateStability(parameter, type, value, stabilityObj) {
    let updateData = {
      'ParameterID': parameter,
      'StabilityCriteria': stabilityObj
    }
    updateData.StabilityCriteria[type] = Number(value);
    this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, updateData));
  }

  render() {
    const { deviceData } = this.props;
    console.log(deviceData)
    if (!this.user) {
      return (<Redirect to='/login' />);
    } else {
      return (
        <div className="mt-3">
          {deviceData &&
            <div>

              <DeviceInfo data={deviceData} update={this.updateLimit} updateStability={this.updateStability} />

            </div>
          }
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    deviceData: state.device.single
  };
}

const connectedPage = connect(mapStateToProps)(Device);
export { connectedPage as Device };
