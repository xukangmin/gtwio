import React from 'react';
import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddParameter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: '',
            equation: '',
            sensorID: '',
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
      const newParameter = {
        DisplayName: this.state.displayName,
        Equation: this.state.equation,
        Alias: this.state.sensorID
      };

      this.props.dispatch(parameterActions.addParameter(this.props.asset, newParameter));
      this.setState(prevState => ({
        displayName: '',
        equation: '',
        sensorID: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        displayName: '',
        equation: '',
        sensorID: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
      const { name, value } = event.target;
      this.setState({ [name]: value});
    }

    render() {
        const { displayName, equation, sensorID } = this.state;

        return(
          <div>
            <Button color="primary" onClick={this.addModalToggle}>Add New Parameter</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Parameter</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="sensorID">Sensor ID</Label>
                    <Input type="text" id="sensorID" name="sensorID" value={sensorID} onChange={this.handleChange}/>
                    <br/>
                    <Label for="displayName">Description</Label>
                    <Input type="text" id="displayName" name="displayName" value={displayName} onChange={this.handleChange}/>
                    <br/>
                    <Label for="serialNumber">Equation</Label>
                    <Input type="text" id="equation" name="equation" value={equation} onChange={this.handleChange}/>
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

export default AddParameter;
