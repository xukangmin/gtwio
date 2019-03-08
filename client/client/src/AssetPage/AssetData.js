import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { AddNewDeviceModal } from '../AssetPage/device_parts/AddNewDeviceModal';
import Loader from '../_components/loader';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import classnames from 'classnames';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import TextInput from '../_components/TextInput';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import ReactDataGrid from "react-data-grid";
import dummyData from '../_components/dummy_data.json'

const columns = [
  { key: "id", name: "Parameter", editable: true },
  { key: "time1", name: "March 8th 2019, 15:25	", editable: true },
  { key: "time2", name: "March 8th 2019, 15:24	", editable: true },
  { key: "time3", name: "March 8th 2019, 15:23	", editable: true },
  { key: "time4", name: "March 8th 2019, 15:22	", editable: true },
  { key: "time5", name: "March 8th 2019, 15:21	", editable: true },
  { key: "time6", name: "March 8th 2019, 15:20	", editable: true }
];

const rows = [
  { id: "Temperature Sensor 0", time1: "60.81", time2: "60.82", time3: "60.84", time4: "60.51", time5: "60.73", time6: "60.2" },
  { id: "Temperature Sensor 1", time1: "60.81", time2: "60.82", time3: "60.84", time4: "60.51", time5: "60.73", time6: "60.2" },
  { id: "GenPara0", time1: "60.81", time2: "60.82", time3: "60.84", time4: "60.51", time5: "60.73", time6: "60.2" }
];

class AssetData extends React.Component {
  constructor(props) {
    super(props);
    console.log(dummyData)
    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    this.data = [];

    for(var i=0; i<dummyData.Devices.length; i++){
      this.data.push(dummyData.Devices[i])
    }


    // this.props.dispatch(dataActions.getAllDeviceData(this.user, this.asset));
  }

  render() {
    // const { data } = this.props;



    return (
      <div>
      <ReactDataGrid
        columns={columns}
        rowGetter={i => rows[i]}
        rowsCount={3}
        enableCellSelect={true}
      />
      </div>
    );
  }
}


function mapStateToProps(state) {
  const { data } = state.data;
  return {
      data : data
  };
}

const connectedPage = connect(mapStateToProps)(AssetData);
export { connectedPage as AssetData };
