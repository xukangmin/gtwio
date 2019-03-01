import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assetActions } from '../../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class MainArea extends React.Component {
    constructor(props) {
      console.log(props)
      super(props);
      this.state = {
        clickedAsset: null,
        displayname: '',
        editModalOpen: false
      }
      this.deleteAsset = this.deleteAsset.bind(this);
      this.editButtonClicked = this.editButtonClicked.bind(this);
      this.editModalToggle = this.editModalToggle.bind(this);
    }

    assetSelected(id,name){
      localStorage.setItem("selectedAssetID", id);
      localStorage.setItem("selectedAssetName", name);
    }

    editModalToggle(){
      this.setState(prevState => ({
        editModalOpen: !prevState.editModalOpen
      }));
    }

    editButtonClicked(){
      this.props.dispatch(assetActions.editAsset(this.props.user,this.state.displayname));
    }

    deleteAsset(asset, user){
      if (confirm("Are you sure to delete this asset?")){
          this.props.dispatch(assetActions.deleteAsset(asset, user));
      }
    }

    render() {
      console.log(this.props.assets)
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
                                  <a href={"/asset/" + singleAsset.AssetID + "/dashboard"}>{singleAsset.DisplayName}
                                  </a>
                                </td>
                                <td style={{color:"#08D800"}}>OK</td>
                                <td><a href={"/asset/" + singleAsset.AssetID + "/device"}>{singleAsset.Devices.length}</a></td>
                                <td>{singleAsset.Location}</td>
                                <td>
                                  <Button name={singleAsset.DisplayName} onClick={this.editModalToggle} style={{marginRight: "10px"}} >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Modal isOpen={this.state.editModalOpen} toggle={this.editModalToggle}>
                                    <ModalHeader toggle={this.editModalToggle}>Edit Asset</ModalHeader>
                                    <ModalBody>
                                      <Form>
                                        <FormGroup>
                                          <Label for="displayname">Name</Label>
                                          <Input type="text" id="displayname" name="displayname" value={singleAsset.DisplayName} onChange={this.handleChange}/>
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
