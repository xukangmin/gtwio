import React from 'react';
import { deviceActions } from '../_actions/deviceAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddNewDevice extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: '',
            serialNumber: '',
            addModalOpen: false
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    addModalToggle(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    addButtonClicked(){
      const newDevice = {
        DisplayName: this.state.displayName,
        SerialNumber: this.state.serialNumber
      }
      this.props.dispatch(deviceActions.addDevice(this.props.user, this.props.asset, newDevice));
      this.setState(prevState => ({
        displayName: '',
        serialNumber: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        displayName: '',
        serialNumber: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
      const { name, value } = event.target;
      this.setState({ [name]: value});
    }

    render() {
        const { displayName, serialNumber } = this.state;

        return(
          <div>
            <Button color="primary" onClick={this.addModalToggle}>Add New Device</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Device</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="displayName">Name</Label>
                    <Input type="text" id="displayname" name="displayName" value={displayName} onChange={this.handleChange}/>
                    <br/>
                    <Label for="serialNumber">Serial Number</Label>
                    <Input type="text" id="serialNumber" name="serialNumber" value={serialNumber} onChange={this.handleChange}/>
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

export default AddNewDevice;
