import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../../../_actions/dataAction';
import { parameterActions } from '../../../_actions/parameterAction';
import { Row, Table } from 'reactstrap';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';

import Loader from '../../../Widgets/Loader';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import EmptyData from '../../../Widgets/EmptyData';

import { Tabs } from 'antd';
import 'antd/dist/antd.css';
const TabPane = Tabs.TabPane;

const ParameterTable = (props) => {
  const parameter = props.data;
  const device = props.device;
  return (
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
          {parameter.map((item, i) =>
            <tr key={i} >
              <td style={{ padding: 0 }}>{moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
              <td style={{ textAlign: "center", fontWeight: "bold", padding: 0 }}>{item.Value.toFixed(2) + props.unit}</td>
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
      AssetID: props.match.params.assetID,
      DeviceID: props.match.params.deviceID,
      activePara: undefined,
      Unit: undefined
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.updateLimit = this.updateLimit.bind(this);
    this.updateStability = this.updateStability.bind(this);

    this.getParameterData = this.getParameterData.bind(this);
  }

  componentDidUpdate() {
    if (this.state.DeviceID && this.state.activePara === undefined) {
      console.log(this.state.activePara)
      console.log(this.props.deviceData)
      this.getParameterData(this.props.deviceData.Parameters[0].ParameterID);
    }
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

  getParameterData(activeParameter) {
    console.log('00000000000', activeParameter)
    this.range = JSON.parse(localStorage.getItem('range'));
    let liveDispatchInterval = 60 * 1000;
    this.setState({ activePara: activeParameter, Unit: this.props.deviceData.Parameters.find(i => i.ParameterID == activeParameter).Unit })
    if (this.range.live) {
      this.props.dispatch(dataActions.getSingleParameterData(activeParameter, new Date().getTime() - this.range.interval * 60 * 1000, new Date().getTime()));
      setInterval(() => {
        this.props.dispatch(dataActions.getSingleParameterData(activeParameter, new Date().getTime() - this.range.interval * 60 * 1000, new Date().getTime()));
      }, liveDispatchInterval);
    } else {
      this.props.dispatch(dataActions.getSingleParameterData(activeParameter, this.range.start * 1000, this.range.end * 1000));
    }
  }

  render() {
    const device = this.props.deviceData;
    let { parameterData } = this.props;
    console.log(device)
    if (!this.user) {
      return (<Redirect to='/login' />);
    } else {
      return (
        <div className="mt-3">
          {device &&
            <div>

              <div>
                <Row>
                  <div className="col-12">
                    <h4>{device.DisplayName}</h4>
                  </div>
                </Row>
                <Row>
                  <div className="col-12">
                    <Tabs onChange={this.getParameterData}>
                      {device.Parameters.map((x, i) =>
                        <TabPane
                          tab={x.DisplayName}
                          key={device.Parameters[i].ParameterID}
                        >
                          <Row>
                            <div className="col-lg-6 col-sm-12">
                              <Table striped>
                                <tbody>
                                  {device.hasOwnProperty('DeviceID') &&
                                  <tr>
                                    <th>Device ID</th>
                                    <td>{device.DeviceID}</td>
                                  </tr>
                                  }
                                  {device.hasOwnProperty('SerialNumber') &&
                                  <tr>
                                    <th>Serial Number</th>
                                    <td>{device.SerialNumber}</td>
                                  </tr>
                                  }
                                  {x.hasOwnProperty('LastCalibrationDate') &&
                                  <tr>
                                    <th>Last Calibration Date</th>
                                    <td>{moment(x.LastCalibrationDate).format('MMMM Do YYYY')}</td>
                                  </tr>
                                  }
                                  {x.hasOwnProperty('CurrentValue') &&
                                    <tr>
                                      <th>Current Value</th>
                                      <td>{x.CurrentValue.toFixed(2) + ' ' + x.Unit}</td>
                                    </tr>
                                  }
                                  {x.hasOwnProperty('CurrentTimeStamp') &&
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
                                  {x.hasOwnProperty('Range') &&
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
                                          onSave={value => this.updateLimit(x.ParameterID, x.Range, "LowerLimit", Number(value))}
                                        />
                                        <span>{x.Unit}</span>
                                      </div>
                                    </td>
                                  </tr>
                                  }
                                  {x.hasOwnProperty('Range') &&
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
                                          onSave={value => this.updateLimit(x.ParameterID, x.Range, "UpperLimit", Number(value))}
                                        />
                                        {x.Unit}
                                      </div>
                                    </td>
                                  </tr>
                                  }
                                  {x.hasOwnProperty('StabilityCriteria') &&
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
                                          onSave={value => this.updateStability(x.ParameterID, "WindowSize", value, x.StabilityCriteria)}
                                        />
                                        {" seconds"}
                                      </div>
                                    </td>
                                  </tr>
                                  }
                                  {x.hasOwnProperty('StabilityCriteria') &&
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
                                          onSave={value => this.updateStability(x.ParameterID, "UpperLimit", value, x.StabilityCriteria)}
                                        />
                                        {x.Unit}
                                      </div>
                                    </td>
                                  </tr>
                                  }
                                  {x.StandardDeviation &&
                                    <tr>
                                      <th>Stability</th>
                                      <td>{x.StandardDeviation.toFixed(2) + ' ' + x.Unit + '/hr'}</td>
                                    </tr>

                                  }

                                  {x.hasOwnProperty('Status') &&
                                  <tr>
                                    <th>Status</th>
                                    <td style={{ color: x.Status == "Valid" ? "green" : "red", fontWeight: "bold" }}>{x.Status}</td>
                                  </tr>
                                  }
                                </tbody>
                              </Table>
                            </div>
                          </Row>
                        </TabPane>
                      )}
                    </Tabs>

                    {parameterData && parameterData.length ?
                      <div className="row mt-3">
                        <div className="col-auto">
                          <h6>History</h6>
                          <ParameterTable data={this.sortTime(parameterData)} unit={this.state.Unit} />
                        </div>
                        <div className="col-sm-auto col-lg-8">
                          <SingleLinePlot parameterData={this.sortTime(parameterData)} unit={this.state.Unit} />
                        </div>
                      </div>
                      :
                      <EmptyData />
                    }
                  </div>
                </Row>
              </div>

            </div>
          }
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const { data } = state.data;
  return {
    deviceData: state.device.single,
    parameterData: data
  };
}

const connectedPage = connect(mapStateToProps)(Device);
export { connectedPage as Device };
