import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';
import AddNewDevice from './modal_parts/addNewDevice';
import AddNewParameter from './modal_parts/addNewParameter';
import Loader from '../_components/loader';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import classnames from 'classnames';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import TextInput from '../_components/TextInput';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import $ from 'jquery';


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
        <td>{props.data.LastCalibrationDate ? moment(props.data.LastCalibrationDate).format('MMMM Do YYYY') : ""}</td>
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
        <td>{moment(new Date(props.data.CurrentTimeStamp)).format('MMMM Do YYYY')}</td>
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
        <td>{props.data.LastCalibrationDate ? moment(props.data.LastCalibrationDate).format('MMMM Do YYYY') : ""}</td>
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
        <td>{moment(new Date(props.data.CurrentTimeStamp)).format('MMMM Do YYYY')}</td>
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

  onRowSelect(row, isSelected, e) {
    let filtered = this.state.selectedRows.filter(function(value,index, arr){
      return value!= row;
    })

    if(isSelected){
      this.setState({
        selectedRows: [...this.state.selectedRows, row]
      });
    } else{
      this.setState({
        selectedRows: filtered
      });
    }
  }

  deleteDevices(){
    console.log(this.state.selectedRows);
    this.props.dispatch(deviceActions.deleteDevice(this.user.UserID, this.asset, device));
  }



  render() {
    const { device, parameter } = this.props;

    function afterSearch(searchText, result) {
      //although this is not used, this function has to be exist
    }

    const cellEditProp = {
      mode: 'click'
    };

    const createCustomDeleteButton = (onClick) => {
      return (
        <button type="button" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={ onClick }><i className="fa fa-trash" aria-hidden="true"></i> Delete Selected</button>
      );
    }

    function linkFormatter(cell, row, enumObject){
      const assetID = enumObject;
      const itemID = row.DeviceID ? row.DeviceID : row.ParameterID;
      const isDeviceOrParameter = row.DeviceID ? "/device/" : "/parameter/";
      const displayText = cell;
      return "<a href = /asset/" + assetID + isDeviceOrParameter + itemID +">" + displayText+ "</a>";
    }

    function parameterFormatter(cell, row) {
      return cell[0].DisplayName;
    }

    function angleFormatter(cell, row){
      return cell+"°"
    }

    function dateFormatter(cell, row){
      return moment(cell).format('MMMM Do YYYY');
    }

    function decimalFormatter(cell, row){
      return cell.toFixed(2)+'°F';
    }

    function onAfterInsertRow(row) {
      // let newRowStr = '';
      //
      // for (const prop in row) {
      //   newRowStr += prop + ': ' + row[prop] + ' \n';
      // }
      // alert('The new row is:\n ' + newRowStr);
    }

    const options = {
      insertText: 'Add Device',
      deleteText: 'Delete',
      deleteBtn: createCustomDeleteButton
       // afterInsertRow: onAfterInsertRow
    }

    const selectRowProp = {
      mode: 'checkbox',
      bgColor: 'pink',
      onSelect: this.onRowSelect
    };

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
                    <AddNewDevice user={this.user} asset={this.asset} dispatch={this.props.dispatch}/>
                    <Button className="deleteButton" color="danger" onClick={this.deleteDevices}><i className="fa fa-trash" aria-hidden="true"></i></Button>
                    <BootstrapTable
                      data={device}
                      options={options}
                      insertRow={true}
                      deleteRow={true}
                      selectRow={selectRowProp}
                      search={true}
                      cellEdit={cellEditProp}
                      version='4'
                      bordered={false}
                      hover
                      height='80%'
                      scrollTop={'Top'}
                      >

                      <TableHeaderColumn
                        isKey
                        headerAlign='center'
                        dataAlign='center'
                        dataField='SerialNumber'
                        editable={false}
                        dataFormat={linkFormatter}
                        formatExtraData={this.asset}
                        dataSort={true}>
                          Serial Number
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        headerAlign='center'
                        dataAlign='center'
                        dataField='DisplayName'
                        dataSort={true}>
                          Description
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        headerAlign='center'
                        dataAlign='center'
                        dataField='Parameters'
                        dataFormat={parameterFormatter}
                        editable={false}
                        dataSort={true}>
                          Parameter
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        headerAlign='center'
                        dataAlign='center'
                        dataField='Tag'
                        dataSort={true}
                        editable={{type: 'select', options: {values: ["ShellInlet", "ShellOutlet", "TubeInlet", "TubeOutlet"]}}}>
                          Location
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        headerAlign='center'
                        dataAlign='center'
                        dataField='Angle'
                        dataFormat={angleFormatter}
                        dataSort={true}
                        editable={{type: 'select', options: {values: ["0", "90", "180", "270"]}}}>
                          Angle
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        headerAlign='center'
                        dataAlign='center'
                        dataField='LastCalibrationDate'
                        editable={false}
                        dataFormat={dateFormatter}
                        dataSort={true}>
                          Last Calibration Date
                      </TableHeaderColumn>
                    </BootstrapTable>
                  </Col>
                </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row className="mt-3">
                <Col>
                  <AddNewParameter user={this.user} asset={this.asset} dispatch={this.props.dispatch}/>
                  <BootstrapTable
                    data={parameter}
                    hover
                    height='80%' scrollTop={ 'Top' }
                    selectRow={selectRowProp}
                    search={ true }
                    options={ options }
                    cellEdit={ cellEditProp }
                    version='4'
                    bordered={ false }>
                    <TableHeaderColumn headerAlign='center' dataAlign='center' isKey={true} dataField='ParameterID' editable={false} dataFormat={linkFormatter} formatExtraData={this.asset} dataSort={ true }>Parameter ID</TableHeaderColumn>
                    <TableHeaderColumn headerAlign='center' dataAlign='center' dataField='DisplayName' dataSort={ true }>Description</TableHeaderColumn>
                    <TableHeaderColumn headerAlign='center' dataAlign='center' width='50%' dataField='Equation' dataSort={ true }>Equation</TableHeaderColumn>
                    <TableHeaderColumn headerAlign='center' dataAlign='center' dataField='CurrentValue' dataSort={ true } editable={false} dataFormat={decimalFormatter}>Current Value</TableHeaderColumn>
                    <TableHeaderColumn headerAlign='center' dataAlign='center' dataField='CurrentTimeStamp' editable={false} dataFormat={dateFormatter} dataSort={ true }>Time Stamp</TableHeaderColumn>
                  </BootstrapTable>
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
