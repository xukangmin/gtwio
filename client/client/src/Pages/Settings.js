import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Loader from '../Widgets/Loader';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col } from 'reactstrap';
import { Tabs, Button, Icon, Switch } from 'antd';
const TabPane = Tabs.TabPane;
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class Settings extends React.Component {
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
      limit: "1",
      contact: "John, Mylee",
      status: true
    },
    {
      asset: "Illinois_Cooling_Tower-2",
      parameter: "Uncertainty",
      limit: "1",
      contact: "John",
      status: true
    },
    {
      asset: "Illinois_Cooling_Tower-3",
      parameter: "Cleaniess Factor",
      limit: "1",
      contact: "John, Mylee, Fred",
      status: true
    }];

    const contact = [{
      name: "John Doe",
      email: "j@gtw.com",
      emailAlert: true,
      phone: "220-399-2131",
      phoneAlert: true
    },{
      name: "Mylee Betts",
      email: "m@gtw.com",
      emailAlert: true,
      phone: "220-231-8874",
      phoneAlert: true
    },
    {
      name: "Fred Blackwell",
      email: "f@gtw.com",
      emailAlert: true,
      phone: "220-390-5498",
      phoneAlert: true
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
        <h3>Settings</h3>

        <Tabs className="mt-1" onChange={callback} type="card" defaultActiveKey="1">
            <TabPane tab="Alerts" key="1">
            <div style={{display: "flex", position: "relative"}}>
        <Button style={{ position: "absolute", top: "0", left: "0"}}  className="mb-1 btn-sm"><i className="fas fa-plus mr-2"></i> Add Alert</Button>
        </div>
        

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
            Criteria
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='contact'
            editable={false}>
            Contacts
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
            
            
            </TabPane>
            <TabPane tab="Contacts" key="2">
            
            
        <div style={{display: "flex", position: "relative"}}>
        <Button style={{ position: "absolute", top: "0", left: "0"}} className="mb-1 btn-sm"><i className="fas fa-plus mr-2"></i> Add Contact</Button>
        </div>
        <BootstrapTable
          tableStyle={{marginTop: "50px"}}
          data={contact}
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
            dataField='name'
            editable={false}
            row='0' rowSpan='2'>
            Name
                  </TableHeaderColumn>

          <TableHeaderColumn headerAlign='center' row='0' colSpan='2'>Contact Method</TableHeaderColumn>
          
          <TableHeaderColumn
            isKey
            headerAlign='center'
            dataAlign='center'
            dataField='email'
            editable={false}
            row='1'>
            E-mail
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='emailAlert'
            dataFormat={statusFormatter}
            editable={false}
            row='1'>
            Notification
                  </TableHeaderColumn>

                  <TableHeaderColumn headerAlign='center' row='0' colSpan='2'>Contact Method</TableHeaderColumn>
          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='phone'
            editable={false}
            row='1'>
            Phone
                  </TableHeaderColumn>

          <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='phoneAlert'
            dataFormat={statusFormatter}
            editable={false}
            row='1'>
            Notification
                  </TableHeaderColumn>

                  <TableHeaderColumn
            headerAlign='center'
            dataAlign='center'
            dataField='status'
            dataFormat={removeFormatter}
            editable={false}
            row='0' rowSpan='2'>
            Del
                  </TableHeaderColumn>


        </BootstrapTable>
      
            
            </TabPane>
        </Tabs>



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

const connectedPage = connect(mapStateToProps)(Settings);
export { connectedPage as Settings };
