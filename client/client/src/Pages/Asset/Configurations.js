import React from 'react';
import { connect } from 'react-redux';

import { deviceActions } from '../../_actions/deviceAction';
import { parameterActions } from '../../_actions/parameterAction';
import { assetActions } from '../../_actions/assetAction';

import AddDevice from '../../Modals/AddDevice';
import AddParameter from '../../Modals/AddParameter';
import Loader from '../../Widgets/Loader';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col } from 'reactstrap';

import '../../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Tabs, Button, Icon, Switch } from 'antd';
const TabPane = Tabs.TabPane;

import { EditEquation } from '../../Modals/EditEquation';
import { log } from 'util';

class ParameterEditor extends React.Component {
  constructor(props) {

    super(props);
    
    this.state = {
      Parameters: props.defaultValue,
      modal: true
    };

    this.updateData = this.updateData.bind(this);
    this.onToggleParameter = this.onToggleParameter.bind(this);
    this.modalToggle = this.modalToggle.bind(this);
    this.addParameter = this.addParameter.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  addParameter() {
    let newParameters = this.state.Parameters.concat([{ DisplayName: "", Type: "Temperature",  Channel: "" }]);
    this.setState({
      Parameters: newParameters
    });
  }

  focus() {
  }

  modalToggle() {
    // if (!this.props.mode) { return }
    this.setState({ modal: !this.state.modal });
    this.props.onUpdate(this.state.Parameters);
  }

  onToggleParameter(event) {
    console.log('ONTOGGLE');

    // if (this.state.Parameters.indexOf(Parameter) < 0) {
    //   this.setState({ Parameters: this.state.Parameters.concat([ Parameter ]) });
    // } else {
    //   this.setState({ Parameters: this.state.Parameters.filter(r => r !== Parameter) });
    // }
    console.log(this.state.Parameters)
    this.props.onUpdate(this.state.Parameters);

  }
  updateData(e) {
    let content = this.state.Parameters;

    console.log(content[e.target.id])
    let par = content[e.target.id];
    let name = e.target.name;
    console.log(name)
    par[name] = e.target.value;
    this.setState({
      Parameters: content
    })
    console.log('UPDATE', this.state.Parameters)
    // this.props.onUpdate(this.state.Parameters);
  }

  handleDelete(x,i){
    let parameters = this.state.Parameters.filter((p, index)=>index!=i);    
    this.setState({
      Parameters: parameters
    });
  }

  render() {

    return (
      <div>{this.state.Parameters.map((x, i) => <span key={i} className="textCenter" style={{ display: "block", textAlign: "center" }}>{x.Type + "-" + x.DisplayName}</span>)}
        <Modal isOpen={this.state.modal} toggle={this.modalToggle} style={{ minWidth: "600px" }}>
          <ModalHeader>Edit Parameter</ModalHeader>
          <ModalBody>
            <table className="table" style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>DisplayName</th>
                  <th>Channel</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody>
                {this.state.Parameters.map((x, i) =>
                  <tr key={i}>
                    <th scope="row" className="p-1">
                      <Input type="select" id={i} name="Type" value={this.state.Parameters[i].Type} onChange={this.updateData}>

                        <option value="Temperature">Temperature</option>
                        <option value="FlowRate">Flow Rate</option>
                        <option value="Humidity">Humidity</option>
                      </Input>
                    </th>
                    <th className="p-1">
                      <Input type="text" id={i} name="DisplayName" value={this.state.Parameters[i].DisplayName} onChange={this.updateData} />
                    </th>
                    <th className="p-1">
                      <Input type="text" id={i} name="Channel" value={this.state.Parameters[i].Channel} onChange={this.updateData} />
                    </th>
                    <th className="p-1">
                      <button type="button" title="Delete this Item" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={() => this.handleDelete(x, i)}><i className="fa fa-trash" aria-hidden="true"></i></button>
                    </th>
                  </tr>)}

              </tbody>
            </table>
            <Button className="ml-2 mb-1 btn-sm" id="add" onClick={this.addParameter}><i className="fas fa-plus"></i> Add New Parameter</Button>

          </ModalBody>
        </Modal></div>


    );
  }
}

class Configurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset = props.match.params.assetID;

    this.editToggle = this.editToggle.bind(this);
    this.discardChanges = this.discardChanges.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.onAfterSaveCell = this.onAfterSaveCell.bind(this);

    this.state = {
      editMode: false,
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

    // this.props.dispatch(parameterActions.getParameters(this.asset));
    // this.props.dispatch(deviceActions.getDevices(this.user, this.asset));
  }

  editToggle(config, device, equation) {
    // let result = config;
    // console.log(config)
    // result.Devices = device;
    // result.Equations = equation;

    if (this.state.editMode) {
      this.props.dispatch(assetActions.updateAssetConfig(this.asset, config));
    }
    this.setState({ editMode: !this.state.editMode });
  }

  discardChanges() {
    this.props.dispatch(assetActions.getAssetConfig(this.asset));
    this.setState({ editMode: !this.state.editMode });
  }

  deleteItem(itemID, itemName, itemType) {
    console.log(...arguments)
    if (confirm("Are you sure to delete " + itemName + "?")) {
      if (itemType == "device") {
        this.props.dispatch(assetActions.removeDevice(itemID));
      } else if (itemType == "parameter") {
        this.props.dispatch(assetActions.removeParameter(itemID));
      }
    }
  }

  onAfterSaveCell(row, cellName, cellValue) {
    console.log(...arguments)
    if (row.SerialNumber) {
      let data = [row.SerialNumber, cellName, cellValue];
      this.props.dispatch(assetActions.updateDevice(data));
    } else if (row.Tag) {
      let data = [row.Tag, cellName, cellValue];
      this.props.dispatch(assetActions.updateParameter(data));
    }
    let rowStr = '';
    for (const prop in row) {
      rowStr += prop + ': ' + row[prop] + '\n';
    }
  }

  render() {
    const asset = this.asset;
    const user = this.user;
    const data = this.props.data;
    let device, parameter = [];

    if (data) {
      device = data.Devices;
      parameter = data.Equations;
    }

    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      afterSaveCell: this.onAfterSaveCell
    };

    const createRegionsEditor = (onUpdate, props) => (<ParameterEditor onUpdate={onUpdate} {...props} />);

    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: "0", right: "0", zIndex: "999" }} >
          <Button type={this.state.editMode ? "default" : "primary"} onClick={() => this.editToggle(data, device, parameter)} className="primary" icon={this.state.editMode ? "save" : "edit"}> {this.state.editMode ? "Save Changes" : "Edit Configurations"} </Button>
          <Button style={{ display: this.state.editMode ? "inline" : "none" }} onClick={() => this.discardChanges()} className="ml-3">Discard Changes</Button>
          <p style={{ color: "red" }} className="mt-2">{this.state.editMode ? "Changes not saved yet.   " : ""}</p>
        </div>
        {device && parameter ?
          <Tabs className="mt-5" onChange={callback} type="card" defaultActiveKey="1">
            <TabPane tab="Devices" key="1">
              <Row className="mt-3">
                <Col>
                  <AddDevice mode={this.state.editMode} user={this.user} asset={this.asset} dispatch={this.props.dispatch} />
                  <BootstrapTable
                    tableStyle={{ backgroundColor: this.state.editMode ? "f0f2f5" : "white", padding: '2px' }}
                    data={device}
                    insertRow={false}
                    deleteRow={false}
                    search={false}
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
                      formatExtraData={this.asset}
                      hidden={this.state.editMode}>
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
                      editable={this.state.editMode}
                      dataSort={true}
                      tdStyle={{ backgroundColor: 'white' }}>
                      SensorID
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='Name'
                      dataSort={true}
                      editable={this.state.editMode}
                      tdStyle={{ backgroundColor: 'white' }}>
                      Description
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='Parameters'
                      dataFormat={parameterFormatter}
                      customEditor={this.state.editMode ? { getElement: createRegionsEditor } : false}
                      editable={this.state.editMode}
                      tdStyle={{ backgroundColor: 'white' }}
                      dataSort={true}
                    >
                      Parameter
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='Tag'
                      dataSort={true}
                      editable={this.state.editMode ? { type: 'select', options: { values: ["ShellInlet", "ShellOutlet", "TubeInlet", "TubeOutlet"] } } : false}
                      tdStyle={{ backgroundColor: 'white' }}>
                      Location
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='Angle'
                      dataFormat={angleFormatter}
                      dataSort={true}
                      editable={this.state.editMode ? { type: 'select', options: { values: ["", "0", "90", "180", "270"] } } : false}
                      tdStyle={{ backgroundColor: 'white' }}>
                      Angle
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='SerialNumber'
                      editable={false}
                      formatExtraData={this.deleteItem}
                      dataFormat={deleteFormatter}
                      hidden={!this.state.editMode}
                      tdStyle={{ backgroundColor: 'white' }}>
                      Delete
                  </TableHeaderColumn>
                  </BootstrapTable>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Parameters & Calculations" key="2">
              <Row className="mt-3">
                <Col>
                  <AddParameter mode={this.state.editMode} user={this.user} asset={this.asset} dispatch={this.props.dispatch} />
                  <BootstrapTable
                    tableStyle={{ backgroundColor: this.state.editMode ? "f0f2f5" : "white" }}
                    data={parameter}
                    hover
                    height='80%' scrollTop={'Top'}
                    search={false}
                    cellEdit={cellEditProp}
                    version='4'
                    bordered={false}
                    condensed
                  >
                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      width="55px"
                      dataField='Tag'
                      editable={false}
                      dataFormat={linkFormatter}
                      formatExtraData={this.asset}
                      hidden={this.state.editMode}>
                      Data
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='left'
                      dataField='Tag'
                      isKey={true}
                      editable={false}
                      dataSort={true}
                      tdStyle={{ whiteSpace: 'normal' }}>
                      Tag
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='left'
                      dataField='Equation'
                      editable={false}
                      formatExtraData={this.state.editMode}
                      dataFormat={modalFormatter}
                      dataSort={true}
                      tdStyle={{ whiteSpace: 'normal', backgroundColor: "white" }}>
                      Equation
                  </TableHeaderColumn>

                    <TableHeaderColumn
                      headerAlign='center'
                      dataAlign='center'
                      dataField='Tag'
                      width='65px'
                      editable={false}
                      formatExtraData={this.deleteItem}
                      dataFormat={deleteFormatter}
                      tdStyle={{ backgroundColor: 'white' }}
                      hidden={!this.state.editMode}>
                      Delete
                  </TableHeaderColumn>
                  </BootstrapTable>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
          :
          <Loader />}
      </div>
    );

    function afterSearch(searchText, result) {
      //although this is not used, this function has to be exist
    }

    function modalFormatter(cell, row, editMode) {
      return editMode ? <EditEquation equation={cell} item={row.Tag} /> : <p>{cell}</p>;
    }

    function deleteFormatter(cell, row, enumObject) {
      let type, name = "";
      if (row.SerialNumber) {
        type = 'device';
        name = row.SerialNumber
      } else if (row.Tag) {
        type = 'parameter';
        name = row.Tag;
      }
      return <button type="button" title="Delete this Item" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={() => enumObject(cell, name, type)}><i className="fa fa-trash" aria-hidden="true"></i></button>
    }

    function linkFormatter(cell, row, enumObject) {
      const assetID = enumObject;
      const deviceOrParameter = row.SerialNumber ? "/device/" : "/parameter/";
      return <Button title="Go to Data Page" onClick={() => location.href = '/asset/' + assetID + deviceOrParameter + cell.split(':')[0]}><Icon type="table" /></Button>
    }

    function parameterFormatter(cell, row) {
      if (typeof cell[0] !== "string") {
        cell = cell.map(x => x.Type + "-" + x.DisplayName);
      }
      return cell ? cell.join(',<br/>') : '';
    }

    function angleFormatter(cell, row) {
      if (typeof (cell) == "number") {
        cell = cell + "°"
      }
      return cell;
    }

    function dateFormatter(cell, row) {
      return moment(cell).format('MMMM Do YYYY');
    }

    function callback(key) {
      // console.log(key);
    }
  }
}

function mapStateToProps(state) {
  return {
    data: state.asset.config
  };
}

const connectedPage = connect(mapStateToProps)(Configurations);
export { connectedPage as Configurations };
