import React from 'react';
import { deviceActions } from '../_actions/deviceAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddDevice extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: '',
            serialNumber: '',
            sensorID: '',
            location: '',
            angle: '',
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
      if (this.state.serialNumber == "" && this.state.displayName == ""){
        alert("Serial Number and Description are required.")
        return;
      } else if (this.state.serialNumber == ""){
        alert("Serial Number is required.")
        return;
      } else if (this.state.displayName == ""){
        alert("Description is required.")
        return;
      }
      const newDevice = {
        DisplayName: this.state.displayName,
        SerialNumber: this.state.serialNumber,
        Alias: this.state.sensorID,
        Tag: this.state.location,
        Angle: this.state.angle
      };
      this.props.dispatch(deviceActions.addDevice(this.props.user, this.props.asset, newDevice));
      this.setState(prevState => ({
        displayName: '',
        serialNumber: '',
        sensorID: '',
        location: '',
        angle: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        displayName: '',
        serialNumber: '',
        sensorID: '',
        location: '',
        angle: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
      const { name, value } = event.target;
      this.setState({ [name]: value});
    }

    render() {
        const { displayName, serialNumber, sensorID, location, angle } = this.state;

        return(
          <div style={{display: this.props.mode ? "block" : "none"}} className="my-2">
            <Button color="primary" onClick={this.addModalToggle}>Add New Device</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Device</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="serialNumber"><strong>Serial Number*</strong></Label>
                    <Input type="text" id="serialNumber" name="serialNumber" value={serialNumber} onChange={this.handleChange}/>
                    <br/>
                    <Label for="displayName"><strong>Description*</strong></Label>
                    <Input type="text" id="displayName" name="displayName" value={displayName} onChange={this.handleChange}/>
                    <br/>
                    <Label for="sensorID">Sensor ID</Label>
                    <Input type="text" id="sensorID" name="sensorID" value={sensorID} onChange={this.handleChange}/>
                    <br/>
                    <Label for="location">Location</Label>
                    <Input type="select" name="location" value={location} onChange={this.handleChange}>
                      <option value=" "></option>
                      <option value="ShellInlet">ShellInlet</option>
                      <option value="ShellOutlet">ShellOutlet</option>
                      <option value="TubeInlet">TubeInlet</option>
                      <option value="TubeOutlet">TubeOutlet</option>
                    </Input>
                    <br/>
                    <Label for="angle">Angle</Label>
                    <Input type="select" name="angle" value={angle} onChange={this.handleChange}>
                      <option value=" "></option>
                      <option value="0">0°</option>
                      <option value="90">90°</option>
                      <option value="180">180°</option>
                      <option value="270">270°</option>
                    </Input>
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

export default AddDevice;
