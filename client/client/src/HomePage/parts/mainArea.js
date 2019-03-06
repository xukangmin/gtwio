import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assetActions } from '../../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class MainArea extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        asset: '',
        displayname: '',
        editModalOpen: false
      }
      this.deleteAsset = this.deleteAsset.bind(this);
      this.editButtonClicked = this.editButtonClicked.bind(this);
      this.editModalToggle = this.editModalToggle.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.assetSelected = this.assetSelected.bind(this);
    }

    editModalToggle(asset_id, name){
      this.setState(prevState => ({
        asset: asset_id,
        displayname: name,
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

    cancelButtonClicked(){
      this.setState(prevState => ({
        asset: '',
        displayname: '',
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

    render() {
        return (
          <div id="MainArea">
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
                                  <Button onClick={()=>this.editModalToggle(singleAsset.AssetID, singleAsset.DisplayName)} style={{marginRight: "10px"}} >
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
                                          <Input type="text" id="location"/>
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
