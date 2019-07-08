import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddAlert extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            assetName: "",
            parameterName: "",
            trigger: "",
            actionType: "",
            message: "",
            addModalOpen: false
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheckChange = this.handleCheckChange.bind(this);
        this.addParameter = this.addParameter.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

    }

    handleDelete (x, i){
      this.state.parameters.filter((p, index)=>index!=i);
    }
    addParameter(){
        this.setState({
          parameter: this.state.parameters.push({Type: "Temperature", Channel:"", DisplayName: ""})
        });
    }
    addModalToggle(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    addButtonClicked(){
      
    }

    cancelButtonClicked(){
    }

    handleChange(event) {
      
    }

    handleCheckChange(event){
      const { name } = event.target;
      this.setState({ [name]: !this.state[name]})
    }

    render() {
        const { assetName, parameterName, sensorID, location, angle, Temperature, FlowRate, Humidity } = this.state;

        return(
          <div className="my-2">
            <Button color="primary" onClick={this.addModalToggle}>Add Alert</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle} style={{minWidth: "600px"}}>
              <ModalHeader toggle={this.addModalToggle}>Add New Alert</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="assetName">Location</Label>
                    <Input type="select" name="assetName" value={assetName} onChange={this.handleChange}>
                      <option value=" "></option>
                      <option value="Illinois_Cooling_Tower-1">Illinois_Cooling_Tower-1</option>
                      <option value="Illinois_Cooling_Tower-2">Illinois_Cooling_Tower-2</option>
                      <option value="Illinois_Cooling_Tower-3">Illinois_Cooling_Tower-3</option>
                    </Input>
                    
                    <br />
                    <Label for="parameterName">Location</Label>
                    <Input type="select" name="parameterName" value={parameterName} onChange={this.handleChange}>
                      <option value=" "></option>
                      <option value="Cleanliness-Factor-1">Cleanliness Factor-1</option>
                      <option value="Average-ShellInlet-Temperature">Average ShellInlet Temperature</option>
                    </Input>
                    <br />
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

export default AddAlert;
