import React from 'react';
import { assetActions } from '../_actions/assetAction';
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
            parameters: [{Type: "Temperature", Channel:"", DisplayName: ""}],
            Temperature: false,
            FlowRate: false,
            Humidity: false,
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
        Name: this.state.displayName,
        SerialNumber: this.state.serialNumber,
        Alias: this.state.sensorID,
        Tag: this.state.location,
        Angle: this.state.angle,
        Parameters: this.state.parameters
      };
      // this.props.dispatch(deviceActions.addDevice(this.props.user, this.props.asset, newDevice));
      this.props.dispatch(assetActions.addDevice(newDevice)); 
      this.setState(prevState => ({
        displayName: '',
        serialNumber: '',
        sensorID: '',
        location: '',
        angle: '',
        parameters: [{Type: "Temperature", Channel:"", DisplayName: ""}],
        Temperature: false,
        FlowRate: false,
        Humidity: false,
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
        parameters: [{Type: "Temperature", Channel:"", DisplayName: ""}],
        Temperature: false,
        FlowRate: false,
        Humidity: false,
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
      
      let { name, value, id } = event.target;
      if (id.split("-")[0] === "Parameter"){
        let content = this.state.parameters;
        console.log(content)
        content[name][id.split("-")[1]] = value;
        console.log(content)
        this.setState({parameters: content});
        console.log(this.state)
      } else {
        this.setState({ [name]: value});
      }
      
    }

    handleCheckChange(event){
      const { name } = event.target;
      this.setState({ [name]: !this.state[name]})
    }

    render() {
        const { displayName, serialNumber, sensorID, location, angle, Temperature, FlowRate, Humidity } = this.state;

        return(
          <div style={{display: this.props.mode ? "block" : "none"}} className="my-2">
            <Button color="primary" onClick={this.addModalToggle}>Add New Device</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle} style={{minWidth: "600px"}}>
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
                  
                  <Label for="parameters">Parameters</Label>
                  <Button className="ml-2 mb-1 btn-sm" id="add" onClick={this.addParameter}><i className="fas fa-plus"></i> Add New Parameter</Button>
                  <div className = "table-responsive">
                  <table className = "table" style={{textAlign: "center"}}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>DisplayName</th>
                        <th>Channel</th>
                        <th>Del</th>
                      </tr>
                    </thead>
                      <tbody>                      
                      {this.state.parameters.map((x,i) =>
                      <tr key={i}>
                        <th scope = "row" className="p-1">                          
                          <Input type="select" id="Parameter-Type" name={i} value={this.state.parameters[i].Type} onChange={this.handleChange}>
                            
                            <option value="Temperature">Temperature</option>
                            <option value="FlowRate">Flow Rate</option>
                            <option value="Humidity">Humidity</option>
                          </Input>
                        </th>
                        <th className="p-1">
                          <Input type="text" id="Parameter-DisplayName" name={i} value={this.state.parameters[i].DisplayName} onChange={this.handleChange}/>
                        </th>   
                        <th className="p-1">
                          <Input type="text" id="Parameter-Channel" name={i} value={this.state.parameters[i].Channel} onChange={this.handleChange}/>
                        </th>        
                        <th className="p-1">
                          <button type="button" title="Delete this Item" className="btn btn-danger react-bs-table-add-btn ml-1" onClick={()=>this.handleDelete(x,i)}><i className="fa fa-trash" aria-hidden="true"></i></button>
                        </th>                        
                    </tr>)}
                    </tbody>
                  </table>
                  
                </div>        
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
