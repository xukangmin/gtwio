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
import dummyData from '../_components/dummy_data.json';

class AssetData extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    // this.props.dispatch(dataActions.getDataByAssetID(this.asset, 1552415788000, 1552416788000));
  }

  render() {
    let timestamps = Object.keys(dummyData);
    let devices= dummyData[timestamps[0]].map(x=>x.DisplayName);
    let columns = [{ key: "id", name: "Time", frozen: true }];
    const ValueFormatter = ({value}) => {
      return <span style={{ color: value['valid'] ? "green" : "red"}}>{value.value}</span>
    };

    for (var i in devices){
      let new_col = {key: devices[i], name: devices[i]};
      new_col['formatter'] = ValueFormatter;
      columns.push(new_col);
    }

    let rows=[];
    for(var i in dummyData){
      let new_row = {id: i};
      for(var value in dummyData[i]){
        new_row[dummyData[i][value].DisplayName] = {value: dummyData[i][value].Value, valid: dummyData[i][value].Valid};
      }
      rows.push(new_row);
    }

    console.log(columns)
    console.log(rows)

    return (
      <div>
        <ReactDataGrid
          columns={columns}
          rowGetter={i => rows[i]}
          rowsCount={rows.length}/>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {

  };
}

const connectedPage = connect(mapStateToProps)(AssetData);
export { connectedPage as AssetData };
