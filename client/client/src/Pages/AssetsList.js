import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { saveAs } from 'file-saver';

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

      this.downloadFile = this.downloadFile.bind(this);
    }

    editModalToggle(asset_id, name, location){
      this.setState(prevState => ({
        asset: asset_id,
        displayname: name,
        location: location,
        editModalOpen: !prevState.editModalOpen
      }));
    }

    downloadFile(e){
      fetch('http://localhost:8002/asset/getConfigByAssetID?AssetID=AWMWqQUfjj', {
        method: 'GET',
      }).then((response) => {
        response.json().then((body) => {
          //action
          //this.setState({ imageURL: `http://localhost:8000/${body.file}` });
          var blob = new Blob([JSON.stringify(body, null, 2)], {type : 'application/json'});
          console.log(body.AssetName);
          saveAs(blob, body.AssetName.toString() + '.json');
        });
      });
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
          return <button type="button" className="btn btn-link" onClick={()=>location.href='/asset/'+ cell + '/dashboard'}><i className ='fas fa-tachometer-alt'></i></button>
        }

        function countFormatter(cell, row, enumObject){
          return cell.length;
        }

        function actionsFormatter(cell, row, enumObject){
          return <div><button type="button" className="btn btn-secondary ml-1" onClick={()=>location.href='/asset/'+ cell + '/configurations'}><i className="fas fa-cog"></i></button>
          <button type="button" className="btn btn-danger ml-1" onClick={()=>enumObject(cell)}><i className="fa fa-trash" aria-hidden="true"></i></button></div>
        }

        const cellEditProp = {
          mode: 'click',
          blurToSave: true,
          afterSaveCell: this.onAfterSaveCell
        };

        return (
          <div id="MainArea">
          <div>
            <button label="Download file" onClick={this.downloadFile}>Download</button>
          </div>
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
              dataField='AssetID'
              editable={false}
              dataFormat={linkFormatter}>
                Dashboard
            </TableHeaderColumn>

            <TableHeaderColumn
              headerAlign='center'
              dataAlign='center'
              dataField='DisplayName'
              editable={true}
              dataSort={true}>
                Asset Name
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
              dataFormat={actionsFormatter}>
                Actions
            </TableHeaderColumn>
          </BootstrapTable>
        </div>

        );
    }

}
 export default AssetList
