
import React from 'react';
import { assetActions } from '../../_actions/assetAction';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Button, Icon } from 'antd';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
           
    this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    this.applyAssetAction = this.applyAssetAction.bind(this);
  }

  onAfterSaveCell(row, cellName, cellValue) {
    this.props.dispatch(assetActions.updateAsset(this.user, row.AssetID, cellName, cellValue));
    let rowStr = "";
    for (const prop in row) {
      rowStr += prop + ': ' + row[prop] + '\n';
    }
  }

  applyAssetAction(asset, action, assetName){
    if (action == "delete"){
      if (confirm(`Are you sure to delete ${assetName}?`)){
        this.props.dispatch(assetActions.deleteAsset(asset, this.user));
      }
    } else if (action == "download"){
      this.props.dispatch(assetActions.getConfigByAssetID(this.user, asset));
    }
  }

  render() {
    const { assets } = this.props;

    function linkFormatter(cell, row){
      console.log(row)
      return <div>
      <Button title="Go to Asset's Dashboard Page" onClick={()=>location.href='/asset/'+ cell + (row.AssetType !== "SensorShow" ? '/dashboard' : '/gauge')}><Icon type="dashboard" /></Button>
      <Button title="Go to Asset's Data Page" className="ml-1" onClick={()=>location.href='/asset/'+ cell + '/data'}><Icon type="table" /></Button>
      <Button title="Go to Asset's Configuration Page" className="ml-1" onClick={()=>location.href='/asset/'+ cell + '/configurations'}><Icon type="setting" /></Button></div>
    }

    function countFormatter(cell){
      return cell.length;
    }

    function actionsFormatter(cell, row, enumObject){
      return <div>
      <button type="button" title="Download Asset Configuration File" className="btn btn-info ml-1" name="download" onClick={()=>enumObject(cell, "download")}><i className="fa fa-download" aria-hidden="true"></i></button>
      <button type="button" title="Delete this Asset" className="btn btn-danger ml-1" name="delete" onClick={()=>enumObject(cell, "delete", row.DisplayName)}><i className="fa fa-trash" aria-hidden="true"></i></button>
      </div>
    }

    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      afterSaveCell: this.onAfterSaveCell
    };

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
          dataField='AssetID'
          editable={false}
          dataFormat={linkFormatter}>
            Pages
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
          formatExtraData={this.applyAssetAction}
          dataFormat={actionsFormatter}>
            Actions
        </TableHeaderColumn>
      </BootstrapTable>
    </div>
    );
  }
}

export default List;
