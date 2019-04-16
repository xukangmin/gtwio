import React from 'react';
import { connect } from 'react-redux';

import { deviceActions } from '../../_actions/deviceAction';
import { parameterActions } from '../../_actions/parameterAction';

import AddDevice from '../../Modals/AddDevice';
import AddParameter from '../../Modals/AddParameter';
import Loader from '../../Widgets/Loader';
import { Row, Col } from 'reactstrap';

import '../../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

import EditEquation from '../../Modals/EditEquation';

class Configurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset = props.match.params.assetID;

    this.props.dispatch(deviceActions.getDevices(this.user, this.asset));
    this.props.dispatch(parameterActions.getParameters(this.asset));

    this.deleteItem = this.deleteItem.bind(this);
    this.onAfterSaveCell = this.onAfterSaveCell.bind(this);

    this.state = {
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

  deleteItem(itemID, itemName, itemType){
    if (confirm("Are you sure to delete " + itemName +"?")){
      if (itemType == "device"){
        this.props.dispatch(deviceActions.deleteDevice(this.user.UserID, this.asset, itemID));
      } else if (itemType == "parameter"){
        this.props.dispatch(parameterActions.deleteParameter(this.asset, itemID));
      }
    }
  }

  onAfterSaveCell(row, cellName, cellValue) {
    if(row.DeviceID){
      let data = {
        DeviceID: row.DeviceID,
        [cellName]: cellValue
      };
      this.props.dispatch(deviceActions.updateDevice(this.user, this.asset, data));
    } else if(row.ParameterID){
      let data = {
        ParameterID: row.ParameterID,
        [cellName]: cellValue
      }
      this.props.dispatch(parameterActions.updateParameter(this.asset, data));
    }
    let rowStr = '';
    for (const prop in row) {
      rowStr += prop + ': ' + row[prop] + '\n';
    }
  }

  render() {
    const { device, parameter } = this.props;
    const asset = this.asset;

    function afterSearch(searchText, result) {
      //although this is not used, this function has to be exist
    }

    function modalFormatter(cell, row, enumObject){
      let type;
      if (row.DeviceID){
        type = 'device';
      } else if (row.ParameterID){
        type = 'parameter';
      }
      return <EditEquation equation={cell} asset={asset} parameter={row.ParameterID} parameters={parameter} devices={device} dispatch={enumObject}/>
    }

    function deleteFormatter(cell, row, enumObject){
      let type;
      if(row.DeviceID){
        type = 'device';
      } else if (row.ParameterID){
        type = 'parameter';
      }
      return <button type="button" title="Delete this Item" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={()=>enumObject(cell, row.DisplayName, type)}><i className="fa fa-trash" aria-hidden="true"></i></button>
    }

    function linkFormatter(cell, row, enumObject){
      const assetID = enumObject;
      const itemID = row.DeviceID ? row.DeviceID : row.ParameterID;
      const isDeviceOrParameter = row.DeviceID ? "/device/" : "/parameter/";
      const displayText = cell;
      return <button type="button" title="Go to Data Page" className="btn btn-success" onClick={()=>location.href='/asset/'+ enumObject + isDeviceOrParameter + itemID}><i className ='fas fa-table'></i></button>
    }

    function parameterFormatter(cell, row) {
      return cell[0] ? cell[0].DisplayName : '';
    }

    function angleFormatter(cell, row){
      return cell + "°";
    }

    function dateFormatter(cell, row){
      return moment(cell).format('MMMM Do YYYY');
    }

    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      afterSaveCell: this.onAfterSaveCell
    };    

    function callback(key) {
      console.log(key);
    }

    return (
      <div>
        {device && parameter? 
        <Tabs onChange={callback} type="card" defaultActiveKey="1">
          <TabPane tab="Devices" key="1">
          <Row className="mt-3">
              <Col>
                <AddDevice user={this.user} asset={this.asset} dispatch={this.props.dispatch}/>
                <BootstrapTable
                  data={device}
                  insertRow={false}
                  deleteRow={false}
                  search={true}
                  cellEdit={cellEditProp}
                  version='4'
                  bordered={false}
                  hover
                  height='80%'
                  scrollTop={'Top'} 
                  condensed                     
                >

                <TableHeaderColumn
                  headerAlign='center'
                  dataAlign='center'
                  dataField='SerialNumber'
                  editable={false}
                  dataFormat={linkFormatter}
                  formatExtraData={this.asset}>
                    Data
                </TableHeaderColumn>

                  <TableHeaderColumn
                    isKey
                    headerAlign='center'
                    dataAlign='center'
                    dataField='SerialNumber'
                    editable={false}
                    dataSort={true}>
                      Serial Number
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    headerAlign='center'
                    dataAlign='center'
                    dataField='Alias'
                    dataSort={true}>
                      SensorID
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
                    dataSort={true}
                    hidden>
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

                  <TableHeaderColumn
                    headerAlign='center'
                    dataAlign='center'
                    dataField='DeviceID'
                    editable={false}
                    formatExtraData={this.deleteItem}
                    dataFormat={deleteFormatter}>
                      Delete
                  </TableHeaderColumn>
                </BootstrapTable>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Parameters & Calculations" key="2">
            <Row className="mt-3">
              <Col>
                <AddParameter user={this.user} asset={this.asset} dispatch={this.props.dispatch}/>
                <BootstrapTable
                  data={parameter}
                  hover
                  height='80%' scrollTop={'Top'}
                  search={true}
                  cellEdit={cellEditProp}
                  version='4'
                  bordered={false}
                  condensed
                >
                  <TableHeaderColumn 
                    headerAlign='center' 
                    dataAlign='center' 
                    isKey={true} 
                    dataField='ParameterID' 
                    editable={false} 
                    hidden>
                      Parameter ID
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    headerAlign='center'
                    dataAlign='center'
                    width="55px"
                    dataField='ParameterID'
                    editable={false}
                    dataFormat={linkFormatter}
                    formatExtraData={this.asset}>
                      Data
                  </TableHeaderColumn>

                  <TableHeaderColumn 
                    headerAlign='center' 
                    dataAlign='left' 
                    dataField='Tag' 
                    editable={false} 
                    dataSort={true}>
                      Tag
                  </TableHeaderColumn>
                  
                  <TableHeaderColumn 
                    headerAlign='center' 
                    dataAlign='left' 
                    width='15%' 
                    dataField='DisplayName' 
                    dataSort={true}>
                      Description
                  </TableHeaderColumn>
                  
                  <TableHeaderColumn 
                    headerAlign='center' 
                    dataAlign='left' 
                    width='60%' 
                    dataField='OriginalEquation' 
                    editable={false}
                    formatExtraData={this.props.dispatch}
                    dataFormat={modalFormatter}
                    dataSort={true}>
                      Equation
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    headerAlign='center'
                    dataAlign='center'
                    width="55px"
                    dataField='ParameterID'
                    editable={false}
                    formatExtraData={this.deleteItem}
                    dataFormat={deleteFormatter}>
                      Delete
                  </TableHeaderColumn>
                </BootstrapTable>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        :
        <Loader/>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.device;
  const parameterData = state.parameter.data;
  return {
      device : data,
      parameter: parameterData
  };
}

const connectedPage = connect(mapStateToProps)(Configurations);
export { connectedPage as Configurations };
