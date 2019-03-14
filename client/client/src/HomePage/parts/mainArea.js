import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assetActions } from '../../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import '../../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class MainArea extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        asset: '',
        displayname: '',
        location: '',
        editModalOpen: false
      }
      this.user = JSON.parse(localStorage.getItem('user'));
      this.deleteAsset = this.deleteAsset.bind(this);
      this.editButtonClicked = this.editButtonClicked.bind(this);
      this.editModalToggle = this.editModalToggle.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleLocationChange = this.handleLocationChange.bind(this);
      this.assetSelected = this.assetSelected.bind(this);
      this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    }

    editModalToggle(asset_id, name, location){
      this.setState(prevState => ({
        asset: asset_id,
        displayname: name,
        location: location,
        editModalOpen: !prevState.editModalOpen
      }));
    }

    editButtonClicked(){
      let updateData = {
        DisplayName: this.state.displayname
      }
      this.props.dispatch(assetActions.updateAsset(this.props.user,this.state.asset,updateData));
      this.setState(prevState => ({
        asset: '',
        displayname: '',
        location: '',
        editModalOpen: !prevState.editModalOpen
      }));
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState(
          {
            asset: name,
            displayname: value
          });
    }

    handleLocationChange(event) {
        const { name, value } = event.target;
        this.setState(
          {
            asset: name,
            location: value
          });
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        asset: '',
        displayname: '',
        location: '',
        editModalOpen: !prevState.editModalOpen
      }));
    }

    deleteAsset(asset, user){
      if (confirm("Are you sure to delete this asset?")){
          this.props.dispatch(assetActions.deleteAsset(asset, user));
      }
    }

    assetSelected(assetid,assetname){
      localStorage.setItem("selectedAssetID", assetid);
      localStorage.setItem("selectedAssetName", assetname);
    }

    onAfterSaveCell(row, cellName, cellValue) {
      // alert(`Save cell ${cellName} with value ${cellValue}`);

      this.props.dispatch(assetActions.updateAsset(this.user, row.AssetID, cellName, cellValue))
      let rowStr = '';
      for (const prop in row) {
        rowStr += prop + ': ' + row[prop] + '\n';
      }

      // alert('Thw whole row :\n' + rowStr);
    }

    render() {
        const { assets } = this.props;

        function linkFormatter(cell, row, enumObject){
          const displayText = cell;
          return "<a href = /asset/" + row.AssetID +"/" + enumObject + ">" + displayText+ "</a>";
        }

        function countFormatter(cell, row, enumObject){
          const displayText = cell.length;
          return "<a href = /asset/" + row.AssetID +"/" + enumObject + ">" + displayText+ "</a>";
        }



        const selectRowProp = {
          mode: 'checkbox',
          bgColor: 'pink'
        };

        const cellEditProp = {
          mode: 'click',
          blurToSave: true,
          afterSaveCell: this.onAfterSaveCell
        };

        const createCustomDeleteButton = (onClick) => {
          return (
            <button type="button" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={ onClick }><i className="fa fa-trash" aria-hidden="true"></i> Delete Selected</button>
          );
        }

        const options = {
        }



        return (
          <div id="MainArea">
          <BootstrapTable
            data={assets}
            insertRow={false}
            deleteRow={false}
            selectRow={selectRowProp}
            search={true}
            cellEdit={cellEditProp}
            options={options}
            version='4'
            bordered={false}
            hover
            >
            <TableHeaderColumn
              dataField='AssetID'
              isKey
              hidden>AssetID
            </TableHeaderColumn>
            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='DisplayName'
              editable={true}
              dataFormat={linkFormatter}
              formatExtraData={"dashboard"}
              dataSort={true}>
                Asset
            </TableHeaderColumn>

            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='Status'
              editable={false}
              dataSort={true}
              style={{color:"#08D800"}}>
                Status
            </TableHeaderColumn>

            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='Devices'
              dataFormat={countFormatter}
              formatExtraData={"device"}
              editable={false}
              dataSort={true}>
                Device Count
            </TableHeaderColumn>

            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='Location'
              dataSort={true}>
                Location
            </TableHeaderColumn>
          </BootstrapTable>


            <div className="table-responsive">
                <table className="table table-striped" style={{textAlign:'center'}}>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Status</th>
                            <th>Device Count</th>
                            <th>Location</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody id="main-table-content">
                        {this.props.assets.map((singleAsset,i) =>
                            <tr key={i}>
                                <td>
                                  <a href={"/asset/" + singleAsset.AssetID + "/dashboard"} onClick={()=>this.assetSelected(singleAsset.AssetID, singleAsset.DisplayName)}>{singleAsset.DisplayName}
                                  </a>
                                </td>
                                <td style={{color:"#08D800"}}>OK</td>
                                <td><a href={"/asset/" + singleAsset.AssetID + "/device"}>{singleAsset.Devices.length}</a></td>
                                <td>{singleAsset.Location}</td>
                                <td>
                                  <Button onClick={()=>this.editModalToggle(singleAsset.AssetID, singleAsset.DisplayName, singleAsset.Location)} style={{marginRight: "10px"}} >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Modal isOpen={this.state.editModalOpen} toggle={this.editModalToggle}>
                                    <ModalHeader toggle={this.editModalToggle}>Edit Asset</ModalHeader>
                                    <ModalBody>
                                      <Form>
                                        <FormGroup>
                                          <Label for="displayname">Name</Label>
                                          <Input type="text" id="displayname" name={singleAsset.AssetID} value={this.state.displayname} onChange={this.handleChange}/>
                                          <br/>
                                          <Label for="location">Location</Label>
                                          <Input type="text" id="location" name={singleAsset.AssetID} value={this.state.location} onChange={this.handleLocationChange}/>
                                        </FormGroup>
                                      </Form>
                                    </ModalBody>
                                    <ModalFooter>
                                      <Button color="primary" id="edit" onClick={this.editButtonClicked}>Save</Button>{' '}
                                      <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
                                    </ModalFooter>
                                  </Modal>
                                  <Button color="danger"
                                          onClick={()=>this.deleteAsset(singleAsset.AssetID, this.props.user)}>
                                            <i className="fa fa-trash" aria-hidden="true"></i>
                                  </Button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        );
    }

}
 export default MainArea
