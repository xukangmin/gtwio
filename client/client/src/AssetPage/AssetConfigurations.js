import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';
import AddNewDevice from './modal_parts/addNewDevice';
import AddNewParameter from './modal_parts/addNewParameter';
import Loader from '../_components/loader';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import classnames from 'classnames';
import toastr from 'toastr';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import $ from 'jquery';

class AssetConfigurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    this.props.dispatch(deviceActions.getAllDeviceData(this.user, this.asset));
    this.props.dispatch(parameterActions.getParameterByAsset(this.asset));

    this.toggle = this.toggle.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.deleteDevices = this.deleteDevices.bind(this);

    this.state = {
      activeTab: '1',
      selectedRows: []
    };
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

    function linkFormatter(cell, row, enumObject){
      const assetID = enumObject;
      const itemID = row.DeviceID ? row.DeviceID : row.ParameterID;
      const isDeviceOrParameter = row.DeviceID ? "/device/" : "/parameter/";
      const displayText = cell;
      return "<a href = /asset/" + assetID + isDeviceOrParameter + itemID +">" + displayText+ "</a>";
    }

    function parameterFormatter(cell, row) {
      return cell[0] ? cell[0].DisplayName : cell;
    }

    function angleFormatter(cell, row){
      return cell + '°';
    }

    function dateFormatter(cell, row){
      return moment(cell).format('MMMM Do YYYY');
    }

    function decimalFormatter(cell, row){
      return cell.toFixed(2) + '°F';
    }



    const options = {
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
                        isKey={true}
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
                    <TableHeaderColumn headerAlign='center' dataAlign='center' dataField='CurrentTimeStamp' editable={false} dataFormat={dateFormatter} dataSort={ true }>Time Stamp</TableHeaderColumn>
                  </BootstrapTable>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
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
