import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';
import { AddNewDeviceModal } from '../AssetPage/device_parts/AddNewDeviceModal';
import Loader from '../_components/loader';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import classnames from 'classnames';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import TextInput from '../_components/TextInput';

const DeviceTableRow = (props) => {
  return(
      <tr>
        <td><a href = {"/asset/" + props.asset + "/device/" + props.data.DeviceID}>{props.data.SerialNumber}</a></td>
        <td>
          <InlineEdit
            value={props.data.DisplayName}
            tag="span"
            type="text"
            saveLabel="Update"
            saveColor="#17a2b8"
            cancelLabel="Cancel"
            cancelColor="#6c757d"
            onSave={value => props.updateName(props.data.DeviceID, value)}
          />
        </td>
        <td>
          <Input type="select">
            <option>{props.data.Parameters[0] ? props.data.Parameters[0].DisplayName : ""}</option>
          </Input>
        </td>
        <td>
          <Input type="select" name={props.data.DeviceID + " Tag"} value = {props.data.Tag} onChange={props.update} style={{display: "inline", width: "50%"}}>
            <option value = {props.data.Tag}>{props.data.Tag}</option>
            <option style = {{display: props.data.Tag=="ShellInlet" ? "none" : "block"}} value = "ShellInlet">ShellInlet</option>
            <option style = {{display: props.data.Tag=="ShellOutlet" ? "none" : "block"}} value = "ShellOutlet">ShellOutlet</option>
            <option style = {{display: props.data.Tag=="TubeInlet" ? "none" : "block"}} value = "TubeInlet">TubeInlet</option>
            <option style = {{display: props.data.Tag=="TubeOutlet" ? "none" : "block"}} value = "TubeOutlet">TubeOutlet</option>
          </Input>
          <Input type="select" name={props.data.DeviceID + " Angle"} value = {props.data.Angle ? props.data.Angle : 0} onChange={props.update} style = {{display: props.data.Parameters[0] && props.data.Parameters[0].DisplayName=="Flow Value" ? "none" : "inline", width: props.data.Parameters[0] && props.data.Parameters[0].DisplayName=="Flow Value" ? "0%" : "30%"}}>
            <option value = {props.data.Angle}>{props.data.Angle+"°"}</option>
            <option style = {{display: props.data.Angle=="0" ? "none" : "block"}} value = "0">0°</option>
            <option style = {{display: props.data.Angle=="90" ? "none" : "block"}} value = "90">90°</option>
            <option style = {{display: props.data.Angle=="180" ? "none" : "block"}} value = "180">180°</option>
            <option style = {{display: props.data.Angle=="270" ? "none" : "block"}} value = "270">270°</option>
          </Input>
        </td>
        <td>{props.data.LastCalibrationDate ? props.data.LastCalibrationDate.slice(0,10) : ""}</td>
        <td><Button color="danger"><i className="fa fa-trash" aria-hidden="true" onClick={()=>props.delete(props.data.DeviceID)}></i></Button></td>
      </tr>
  );
};

const ParameterTableRow = (props) => {
  return(
      <tr>
        <td><a href = {"/asset/"+ props.asset + "/parameter/" + props.data.ParameterID}>{props.data.ParameterID}</a></td>
        <td>
          <InlineEdit
            value={props.data.DisplayName}
            tag="span"
            type="text"
            saveLabel="Update"
            saveColor="#17a2b8"
            cancelLabel="Cancel"
            cancelColor="#6c757d"
            onSave={value => props.updateName(props.data.ParameterID, value)}
          />
        </td>
        <td>{props.data.Equation}</td>
        <td>{props.data.CurrentValue.toFixed(2)}</td>
        <td>{new Date(props.data.CurrentTimeStamp).toLocaleString()}</td>
        <td><Button color="danger"><i className="fa fa-trash" aria-hidden="true" onClick={()=>props.delete(props.data.ParameterID)}></i></Button></td>
      </tr>
  );
};

const AddNewParameterForm = ({parameter,onChange,errors}) => {
    return (
        <form>
            <TextInput
                name="DisplayName"
                label="Name"
                placeholder="(required)"
                value={parameter.DisplayName}
                onChange={onChange}
                error={errors.DisplayName} />
            <TextInput
                name="Equation"
                label="Equation"
                placeholder="(required)"
                value={parameter.Equation}
                onChange={onChange}
                error={errors.Equation} />
        </form>
    );
};

const AddNewParameterModal = ({parameter,onChange,errors,onAdd,isOpen,onClose}) => {
    return (
        <div>
            <Modal isOpen={isOpen} toggle={onClose} className="modal-dialog-centered">
                <ModalHeader toggle={onClose}>Add New Parameter</ModalHeader>
                <ModalBody>
                    <AddNewParameterForm
                        parameter={parameter}
                        onChange={onChange}
                        errors={errors}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={onAdd}>Add</Button>{' '}
                    <Button color="secondary" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
      </div>

    );
}


class AssetConfigurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    this.props.dispatch(deviceActions.getAllDeviceData(this.user, this.asset));
    this.props.dispatch(parameterActions.getParameterByAsset(this.asset));

    this.toggle = this.toggle.bind(this);
    this.AddDevice = this.AddDevice.bind(this);
    this.updateDeviceState = this.updateDeviceState.bind(this);
    this.AddDeviceModalOpen = this.AddDeviceModalOpen.bind(this);
    this.AddDeviceModalClose = this.AddDeviceModalClose.bind(this);
    this.UpdateDevice = this.UpdateDevice.bind(this);
    this.UpdateDeviceDisplayName = this.UpdateDeviceDisplayName.bind(this);
    this.UpdateParameterDisplayName = this.UpdateParameterDisplayName.bind(this);
    this.DeleteDevice = this.DeleteDevice.bind(this);

    this.AddParameterModalOpen = this.AddParameterModalOpen.bind(this);
    this.AddParameterModalClose = this.AddParameterModalClose.bind(this);
    this.AddParameter = this.AddParameter.bind(this);
    this.updateParameterState = this.updateParameterState.bind(this);
    this.DeleteParameter = this.DeleteParameter.bind(this);

    this.state = {
      activeTab: '1',
      NewDevice: {
        DisplayName: '',
        SerialNumber: ''
      },
      NewParameter: {
        DisplayName: '',
        Equation: ''
      },
      addNewDeviceModalOpen: false,
      addNewParameterModalOpen: false
    };
  }

  componentDidMount() {
    this.dispatchParameterContinuously = setInterval(() => {
      this.props.dispatch(parameterActions.getParameterByAsset(this.asset));
    }, 5000);
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
    console.log(this.state.NewDevice)
    this.props.dispatch(deviceActions.addNewDevice(this.user, this.asset, this.state.NewDevice));
    this.AddDeviceModalClose();
  }

  UpdateDevice(event){
    const device = event.target.name.split(" ")[0];
    const item = event.target.name.split(" ")[1];
    let updateData = {
        'DeviceID': device
    }
    updateData[item] = event.target.value;
    this.props.dispatch(deviceActions.updateDevice(this.user.UserID, this.asset, updateData));
    toastr.success("Device location updated.");
  }

  UpdateDeviceDisplayName(id, data){
    let updateData = {
        'DeviceID': id,
        'DisplayName': data
    }
    this.props.dispatch(deviceActions.updateDevice(this.user.UserID, this.asset, updateData));
    toastr.success("Device description updated.");
  }

  UpdateParameterDisplayName(id, data){
    let updateData = {
        'ParameterID': id,
        'DisplayName': data
    }
    this.props.dispatch(paramterActions.updateParameter(this.user.UserID, this.asset, updateData));
    toastr.success("Paramter description updated.");
  }

  DeleteDevice(device){
    if (confirm("Are you sure to delete this device?")){
        this.props.dispatch(deviceActions.deleteDevice(this.user.UserID, this.asset, device));
    }
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

  AddParameter(event) {
    console.log(this.state);
    if (this.state.NewParameter.DisplayName === "") {
      this.setState({errors: {DisplayName: "Name cannot be empty"}});
      return;
    }
    this.props.dispatch(parameterActions.addNewParameter(this.asset, this.state.NewParameter.DisplayName, this.state.NewParameter.Equation));
    this.AddParameterModalClose();
  }

  updateParameterState(event) {
    const field = event.target.name;
    let parameter = Object.assign({}, this.state.NewParameter);
    parameter[field] = event.target.value;
    this.setState({errors: {}});
    return this.setState({NewParameter: parameter});
  }

  AddParameterModalOpen() {
    this.setState({
      addParameterModalOpen: true,
      NewParameter: {
        DisplayName: '',
        Equation: ''
      },
      errors: {
      }
    });
  }

  AddParameterModalClose() {
    this.setState({addParameterModalOpen: false});
  }

  DeleteParameter(parameter){
    if (confirm("Are you sure to delete this parameter?")){
        this.props.dispatch(parameterActions.DeleteParameter(this.asset, parameter));
    }
  }

  render() {
    const { device, parameter } = this.props;
    return (
      <div>
        {device && parameter?
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
                                    <th>Description</th>
                                    <th>Parameter</th>
                                    <th>Location Tag</th>
                                    <th>Last Calibration Date</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody id="main-table-content">
                                {device.map((singleDevice,i) =>
                                    <DeviceTableRow data={singleDevice} asset={this.asset} update={this.UpdateDevice} updateName={this.UpdateDeviceDisplayName} delete={this.DeleteDevice} key={i}/>
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
                  <button type="button" className="btn btn-info mb-3" href="#" onClick={this.AddParameterModalOpen}>Add Parameter</button>
                  <div className="table-responsive">
                      <table className="table table-striped" style={{textAlign:'center'}}>
                          <thead>
                              <tr>
                                  <th>Parameter ID</th>
                                  <th>Description</th>
                                  <th>Equation</th>
                                  <th>Current Value</th>
                                  <th>Time Stamp</th>
                                  <th>Delete</th>
                              </tr>
                          </thead>
                          <tbody id="main-table-content">
                              {parameter.map((singleParameter,i) =>
                                  <ParameterTableRow data={singleParameter} asset={this.asset} updateName={this.UpdateParameterDisplayName} delete={this.DeleteParameter} key={i}/>
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
          <AddNewParameterModal
            parameter={this.state.NewParameter}
            onChange={this.updateParameterState}
            onAdd={this.AddParameter}
            errors={this.state.errors}
            isOpen={this.state.addParameterModalOpen}
            onClose={this.AddParameterModalClose}
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
  const parameterData = state.parameter.data;
  return {
      device : data,
      parameter: parameterData
  };
}

const connectedPage = connect(mapStateToProps)(AssetConfigurations);
export { connectedPage as AssetConfigurations };
