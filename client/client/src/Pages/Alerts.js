import React from 'react';
import { connect } from 'react-redux';
import AddAlert from '../Modals/AddAlert';
import { Redirect } from 'react-router-dom';
import Loader from '../Widgets/Loader';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col } from 'reactstrap';
import { Tabs, Button, Icon, Switch } from 'antd';
const TabPane = Tabs.TabPane;
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class Alerts extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  //alert
  //columns to show on Data
  //refresh interval
  render() {
    const alertsParameters = [{
      asset: "Illinois_Cooling_Tower-1",
      parameter: "Cleaniess Factor",
      limit: "> 1.5",
      contact: "Email: john@gtwlabs.com",
      status: true
    },
    {
      asset: "Illinois_Cooling_Tower-2",
      parameter: "Uncertainty",
      limit: "> 5",
      contact: "SMS: 847-364-2600",
      status: true
    },
    {
      asset: "Illinois_Cooling_Tower-3",
      parameter: "Heat Transfer Rate",
      limit: ">= 13456012",
      contact: "SMS: 123-456-7890",
      status: true
    }];

    function statusFormatter(cell, row) {

      return <Switch defaultChecked />;
    }

    function removeFormatter(){
      return <button type="button" title="Delete this Item" className="btn btn-danger react-bs-table-add-btn ml-1"><i className="fa fa-trash" aria-hidden="true"></i></button>
    
    }

    function callback(key) {
      // console.log(key);
    }

    return (
      <div>
        <h3>Alerts</h3>

        {/*
        <div style={{display: "flex", position: "relative"}}>
          <Button style={{ position: "absolute", top: "0", left: "0"}}  className="mb-1 btn-sm"><i className="fas fa-plus mr-2"></i> Add Alert</Button>
        </div> ! --> */}

        <AddAlert />

        <BootstrapTable
          tableStyle={{marginTop: "50px"}}
          data={alertsParameters}
          insertRow={false}
          deleteRow={false}
          search={false}
          version='4'
          bordered={true}
          hover
          scrollTop={'Top'}
          condensed
        >

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='asset'
            editable={false}>
            Asset
                  </TableHeaderColumn>

          <TableHeaderColumn
            isKey
            headerAlign='center'
            dataAlign='center'
            dataField='parameter'
            editable={false}>
            Parameter
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='limit'
            editable={false}>
            Trigger
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='contact'
            editable={false}>
            Actions
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='status'
            dataFormat={statusFormatter}
            editable={false}>
            ON/OFF
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='status'
            dataFormat={removeFormatter}
            editable={false}>
            Del
                  </TableHeaderColumn>


        </BootstrapTable>
            



        </div>

        
        
    )

  }
}

function mapStateToProps(state) {
  const { data, msg } = state.asset
  return {
    assets: data,
    msg: msg
  };
}

const connectedPage = connect(mapStateToProps)(Alerts);
export { connectedPage as Alerts };
