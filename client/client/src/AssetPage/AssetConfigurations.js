import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { AddNewDeviceModal } from '../AssetPage/device_parts/AddNewDeviceModal';
import './asset.css';
import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col, Button } from 'reactstrap';
import classnames from 'classnames';
import toastr from 'toastr';

const DeviceTableRow = (props) => {
  return(
      <tr>
        <td><a href = {"/asset/ASSETID0/detail/" + props.data.DeviceID}>{props.data.SerialNumber}</a></td>
        <td>
          <select>
            <option>{props.data.Parameters[0] ? props.data.Parameters[0].DisplayName : ""}</option>
          </select>
        </td>
        <td>
          <select name={props.data.DeviceID} value = {props.data.Tag} onChange={props.update}>
            <option value = {props.data.Tag}>{props.data.Tag}</option>
            <option style = {{display: props.data.Tag=="ShellInlet" ? "none" : "block"}} value = "ShellInlet">ShellInlet</option>
            <option style = {{display: props.data.Tag=="ShellOutlet" ? "none" : "block"}} value = "ShellOutlet">ShellOutlet</option>
            <option style = {{display: props.data.Tag=="TubeInlet" ? "none" : "block"}} value = "TubeInlet">TubeInlet</option>
            <option style = {{display: props.data.Tag=="TubeOutlet" ? "none" : "block"}} value = "TubeOutlet">TubeOutlet</option>
          </select>
        </td>
        <td>{props.data.LastCalibrationDate ? props.data.LastCalibrationDate.slice(0,10) : ""}</td>
        <td><Button color="danger"><i className="fa fa-trash" aria-hidden="true" onClick={()=>props.delete(props.data.DeviceID)}></i></Button></td>
      </tr>
  );
};

const ParameterTableRow = (props) => {
  return(
      <tr>
        <td>Avg_ShellInlet</td>
        <td>a=b*c</td>
        <td>This is a description</td>
      </tr>
  );
};

class AssetConfigurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    this.props.dispatch(deviceActions.getAllDeviceData(this.user, this.asset));

    this.toggle = this.toggle.bind(this);
    this.AddDevice = this.AddDevice.bind(this);
    this.updateDeviceState = this.updateDeviceState.bind(this);
    this.AddDeviceModalOpen = this.AddDeviceModalOpen.bind(this);
    this.AddDeviceModalClose = this.AddDeviceModalClose.bind(this);
    this.updateDeviceTag = this.updateDeviceTag.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
    // this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);


    this.state = {
      activeTab: '1',
      NewDevice: {
        DisplayName: '',
        SerialNumber: ''
      },
      addNewDeviceModalOpen: false
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  AddDevice(event) {
    if (this.state.NewDevice.DisplayName === "") {
      this.setState({errors: {DisplayName: "Name cannot be empty"}});
      return;
    }

    this.props.dispatch(deviceActions.addNewDevice(this.user, this.asset, this.state.NewDevice));
    this.AddDeviceModalClose();
  }

  updateDeviceState(event) {
    const field = event.target.name;
    let device = Object.assign({}, this.state.NewDevice);
    device[field] = event.target.value;
    this.setState({errors: {}});
    return this.setState({NewDevice: device});
  }

  AddDeviceModalOpen() {
    this.setState({
      addDeviceModalOpen: true,
      NewDevice: {
        DisplayName: '',
        SerialNumber: ''
      },
      errors: {
      }
    });
  }

  AddDeviceModalClose() {
    this.setState({addDeviceModalOpen: false});
  }

  updateDeviceTag(event){
    this.props.dispatch(deviceActions.updateDeviceTag(this.user.UserID, this.asset, event.target.name, event.target.value));
    toastr.success("Device location updated.");
  }

  deleteDevice(device){
    if (confirm("Are you sure to delete this device?")){
        this.props.dispatch(deviceActions.deleteDevice(this.user.UserID, this.asset, device));
    }
  }

  render() {
    const { device } = this.props;
    return (
      <div>
        {device?
          <div>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}
                >
                  Devices
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  Parameters & Calculations
                </NavLink>
              </NavItem>
            </Nav>

          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
                <Row className="mt-3">
                  <Col>
                    <button type="button" className="btn btn-info mb-3" href="#" onClick={this.AddDeviceModalOpen}>Add Device</button>
                    <div className="table-responsive">
                        <table className="table table-striped" style={{textAlign:'center'}}>
                            <thead>
                                <tr>
                                    <th>Serial Numer</th>
                                    <th>Parameter</th>
                                    <th>Location Tag</th>
                                    <th>Last Calibration Date</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody id="main-table-content">
                                {device.map((singleDevice,i) =>
                                    <DeviceTableRow data={singleDevice} update={this.updateDeviceTag} delete={this.deleteDevice} key={i}/>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </Col>
                </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row className="mt-3">
                <Col>
                  <button type="button" className="btn btn-info mb-3" href="#" onClick={this.AddDeviceModalOpen}>Add Parameter</button>
                  <div className="table-responsive">
                      <table className="table table-striped" style={{textAlign:'center'}}>
                          <thead>
                              <tr>
                                  <th>Parameter Name</th>
                                  <th>Equation</th>
                                  <th>Description</th>
                              </tr>
                          </thead>
                          <tbody id="main-table-content">
                              {device.map((singleDevice,i) =>
                                  <ParameterTableRow data={singleDevice} key={i}/>
                              )}
                          </tbody>
                      </table>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </TabContent>

          <AddNewDeviceModal
            device={this.state.NewDevice}
            onChange={this.updateDeviceState}
            onAdd={this.AddDevice}
            errors={this.state.errors}
            isOpen={this.state.addDeviceModalOpen}
            onClose={this.AddDeviceModalClose}
          />
          </div>
        :
        <Loader/>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data, addedData } = state.device;
  return {
      device : data
  };
}

const connectedPage = connect(mapStateToProps)(AssetConfigurations);
export { connectedPage as AssetConfigurations };
