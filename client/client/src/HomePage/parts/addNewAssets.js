import React from 'react'
import { assetActions } from '../../_actions/assetAction'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddNewAssets extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayname: '',
            addModal: false
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.editAsset = this.editAsset.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    addModalToggle(){
      this.setState(prevState => ({
        addModal: !prevState.addModal
      }));
    }

    addButtonClicked(){
      this.props.dispatch(assetActions.addAsset(this.props.user,this.state.displayname));
      this.setState(prevState => ({
        addModal: !prevState.addModal
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        addModal: !prevState.addModal
      }));
    }

    editAsset(){
      this.props.dispatch(assetActions.editAsset(this.props.user,this.state.displayname));
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState( { [name]: value} );
    }

    render() {
        const { displayname } = this.state;

        return(
          <div>
            <Button color="primary" onClick={this.addModalToggle}>Add New Asset</Button>
            <Modal isOpen={this.state.addModal} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="displayname">Name</Label>
                    <Input type="text" id="displayname" name="displayname" value={this.state.displayname} onChange={this.handleChange}/>
                    <br/>
                    <Label for="location">Location</Label>
                    <Input type="text" id="location"/>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" id="add" onClick={this.addButtonClicked}>Add</Button>{' '}
                <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
              </ModalFooter>
            </Modal>
          </div>
        );
    }

}

export default AddNewAssets
