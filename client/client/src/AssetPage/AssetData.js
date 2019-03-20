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
import * as moment from 'moment';
window['moment'] = moment;

class AssetData extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let { data } = this.props;

    const ValueFormatter = ({value}) => {
      return <span style={{ color: value['valid'] ? "green" : "red"}}>{value.value}</span>
    };

    function TitleFormatter (value) {
      value = value.split('/');
      let title = '<span>';
      for (let i in value){
        title += value[i]+'<br>';
      }
      title += '</span>';
      return <span style={{ color: value['valid'] ? "green" : "red"}}>{value.value}</span>
    };

    let col = [{ key: "id", name: "Time", frozen: true, width: 185 }];
    let row = [];

    if (data){
      let items = data[0].Data.map(x=>x.DisplayName);

      for (let itemNo in items){
        let new_col = {key: itemNo, name: items[itemNo], resizable: true, dragable: true};
        new_col['formatter'] = ValueFormatter;
        col.push(new_col);
      }
    }

    for (let time in data){
      let new_row = {id: moment(data[time].TimeStamp).format('MMMM Do YYYY, H:mm')};
      for (let device in data[time].Data){
          let device_id = device;
          new_row[device_id]= {
            value: data[time].Data[device].Value.toFixed(2) + data[time].Data[device].Unit,
            valid: data[time].Data[device].Valid
          };
      }
      row.unshift(new_row);
    }

    return (
      <div>
      <ReactDataGrid
        columns={col}
        rowGetter={i => row[i]}
        rowsCount={row.length}
        minHeight={800}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.data
  return {
    data: data
  };
}

const connectedPage = connect(mapStateToProps)(AssetData);
export { connectedPage as AssetData };
