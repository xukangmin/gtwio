import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assetActions } from '../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
// import '../../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class AssetList extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        asset: '',
        displayname: '',
        location: '',
        editModalOpen: false
      }
      this.user = JSON.parse(localStorage.getItem('user'));
      this.deleteItem = this.deleteItem.bind(this);
      this.editButtonClicked = this.editButtonClicked.bind(this);
      this.editModalToggle = this.editModalToggle.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleLocationChange = this.handleLocationChange.bind(this);
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

    deleteItem(asset){
      if (confirm("Are you sure to delete this asset?")){
          this.props.dispatch(assetActions.deleteAsset(asset, this.user));
      }
    }

    onAfterSaveCell(row, cellName, cellValue) {
      this.props.dispatch(assetActions.updateAsset(this.user, row.AssetID, cellName, cellValue))
      let rowStr = '';
      for (const prop in row) {
        rowStr += prop + ': ' + row[prop] + '\n';
      }
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

        function deleteFormatter(cell, row, enumObject){
          return <button type="button" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={()=>enumObject(cell)}><i className="fa fa-trash" aria-hidden="true"></i></button>
        }

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

        return (
          <div id="MainArea">
          <BootstrapTable
            data={assets}
            insertRow={false}
            deleteRow={false}
            search={true}
            cellEdit={cellEditProp}
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

            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='AssetID'
              editable={false}
              formatExtraData={this.deleteItem}
              dataFormat={deleteFormatter}>
                Delete
            </TableHeaderColumn>
          </BootstrapTable>




            </div>

        );
    }

}
 export default AssetList
