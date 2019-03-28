import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

class AddAsset extends React.Component {
    constructor(props) {
        super(props);

        this.user = JSON.parse(localStorage.getItem('user'));

        this.state = {
            addModalOpen: false,
            addType: 'import',
            manualPage: 1,
            
            DisplayName: "",
            Location: "",
            Devices: [{
              key: 0, 
              SerialNumber: "",
              DisplayName: "",
              Parameters: "",
              Tag: "",
              Angle: ""
            }],
            Equations: [{
              key: 0, 
              DisplayName: "",
              Equation: ""
            }]
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.handleAddType = this.handleAddType.bind(this);

        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.resetForm = this.resetForm.bind(this);
        
        this.handleUploadFile = this.handleUploadFile.bind(this);
        
        this.handleInfoChange = this.handleInfoChange.bind(this);
        this.handleDevicesChange = this.handleDevicesChange.bind(this);
        this.handleEquationsChange = this.handleEquationsChange.bind(this);
        
        this.addDevice = this.addDevice.bind(this);
        this.addEquation = this.addEquation.bind(this);
        
        this.onClickNext = this.onClickNext.bind(this);
        this.onClickPrev = this.onClickPrev.bind(this);
    }

    addModalToggle(t){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    resetForm(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));

      this.setState({
        addType: 'import',
        manualPage: 1,
        
        DisplayName: "",
        Location: "",
        Devices: [{
          key: 0, 
          SerialNumber: "",
          DisplayName: "",
          Parameters: "",
          Tag: "",
          Angle: ""
        }],
        Equations: [{
          key: 0, 
          DisplayName: "",
          Equation: ""
        }]
      });
    }

    addButtonClicked(){
      if (this.state.addType == "manual"){
        let data = {
          AssetName: this.state.DisplayName,
          Location: this.state.Location,
          Devices: this.state.Devices,
          Equations: this.state.Equations
        };
        this.props.dispatch(assetActions.addAssetByConfig(this.user, data));
      }
      this.resetForm();
    }

    cancelButtonClicked(){
      this.resetForm();
    }
  
    handleAddType(e){
      this.setState({
        addType: e.target.name
      });
    }

    handleUploadFile(e) {
      let data = new FormData();
      data.append('configFile', this.uploadInput.files[0]);
      data.append('UserID', this.user.UserID);
      
      this.props.dispatch(assetActions.addAssetByConfigFile(this.user, data));
    }

    handleInfoChange(e){
      const { name, value } = event.target;
      this.setState({[name]: value}, () => console.log(this.state));
    }

    onClickNext(){
      let currentPage = this.state.manualPage;
      this.setState({
        manualPage: currentPage + 1
      });
    }

    onClickPrev(){
      let currentPage = this.state.manualPage;
      this.setState({
        manualPage: currentPage - 1
      });
    }

    addDevice(){
      this.setState((prevState) => ({
        Devices: [...prevState.Devices, {
          key: this.state.Devices.length, 
          SerialNumber: "",
          DisplayName: "",
          Parameters: "",
          Tag: "",
          Angle: ""
        }],
      }));
    }

    handleDevicesChange(e){
      let devices = [...this.state.Devices]
      devices[e.target.id][e.target.name] = e.target.value
      this.setState({ devices }, () => console.log(this.state.devices));
    }

    addEquation(){
      this.setState((prevState) => ({
        Equations: [...prevState.Equations, {
          key: this.state.Equations.length, 
          DisplayName: "",
          Equation: ""
        }],
      }));
    }

    handleEquationsChange(e){
      let equations = [...this.state.Equations]
      equations[e.target.id][e.target.name] = e.target.value
      this.setState({ equations }, () => console.log(this.state.equations));
    }

    render() {

      let devices = this.state.Devices;
      let equations = this.state.Equations;

      return(
        <div>
          <Button color="primary" name="addButton" onClick={e=>this.addModalToggle(e)}>Add New Asset</Button>
                  
          <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle} style={{maxWidth: "750px"}}>
            <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
            <ModalBody>
              <Form>
                  <div className="mb-2" style={{textAlign: "center"}}>
                    <Button color={this.state.addType == "import" ? "primary" : "light"} name="import" className="mr-3" 
                            onClick={(e)=>this.handleAddType(e)}>
                      Import Configuration File
                    </Button>
                    
                    <Button color={this.state.addType == "manual" ? "primary" : "light"} name="manual" 
                            onClick={(e)=>this.handleAddType(e)}>
                      Add Manually
                    </Button>
                  </div>     
              </Form>

              <div className="py-5 px-3" style={{border: "1px solid #dee2e6"}}>
                
                <Form onSubmit={this.handleUploadFile} style={{display: this.state.addType == "import" ? "block" : "none"}}>
                  <div style={{textAlign: "center"}}>
                    <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept='.json' />
                  </div>
                  <br/><br/>
                  <div>
                    <Button color="success pull-right mt-2">Add Asset</Button>
                  </div>
                </Form>

                <Form style={{display: this.state.addType == "manual" ? "block" : "none"}} >
                  
                  <FormGroup style={{display: this.state.manualPage == 1 ? "block" : "none"}}>
                    <h2>Asset Information</h2>
                    <Row>
                      <Col md="6">
                        <Label for="assetName"><strong>Asset Name*</strong></Label>
                        <Input type="text" id="assetName" name="DisplayName" 
                               value={this.state.DisplayName} 
                               onChange={e=>this.handleInfoChange(e)}/>
                        <br/>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="6">
                        <Label for="location">Location</Label>
                        <Input type="text" id="location" name="Location" 
                               value={this.state.Location} 
                               onChange={e=>this.handleInfoChange(e)}/>
                      </Col>
                    </Row>
                    
                    <Button color="link" className="pull-right mt-3" id="next" onClick={this.onClickNext}>Next></Button>
                  </FormGroup>
                  
                  <FormGroup style={{display: this.state.manualPage == 2 ? "block" : "none"}} >
                    
                    <h2>Devices</h2>
                    <div className = "table-responsive">
                      <table className = "table mt-3" style={{textAlign: "center"}}>
                        <thead>
                          <tr>
                            <th>Serial Number*</th>
                            <th>Description*</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Angle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {devices.map((x,i) =>
                            <tr key={x.key}>
                              <th scope = "row" className="p-0">
                                <Input type="text" id={x.key} name="SerialNumber" 
                                       value={devices[x.key].SerialNumber} onChange={e=>this.handleDevicesChange(e)}/>
                              </th>
                              <td className="p-0">
                                <Input type="text" id={x.key} name="DisplayName" 
                                       value={devices[x.key].DisplayName} onChange={e=>this.handleDevicesChange(e)}/>
                              </td>
                              <td className="p-0">
                                <Input type="select" id={x.key} name="Parameters" 
                                       value={devices[x.key].Parameters} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="Temperature">Temperature</option>
                                  <option value="FlowRate">Flow Rate</option>
                                </Input>  
                              </td>
                              <td className="p-0">
                                <Input type="select" id={x.key} name="Tag" 
                                       value={devices[x.key].Tag} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="TubeInlet">Tube Inlet</option>
                                  <option value="TubeOutlet">Tube Outlet</option>
                                  <option value="ShellInlet">Shell Inlet</option>
                                  <option value="ShellOutlet">Shell Outlet</option>
                                </Input>
                              </td>
                              <td className="p-0">
                                <Input type="select" id={x.key} name="Angle" 
                                       value={devices[x.key].Angle} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="0">0°</option>
                                  <option value="90">90°</option>
                                  <option value="180">180°</option>
                                  <option value="270">270°</option>
                                </Input>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>                             
                    <Button color="secondary" id="add" onClick={this.addDevice}><i className="fas fa-plus"></i> Add Device</Button>
                    <br/><br/>
                    <Button color="link" className="pull-right mt-3" id="next" onClick={this.onClickNext}>Next></Button>          
                    <Button color="link" className="pull-right mt-3 mr-3" id="prev" onClick={this.onClickPrev}>{"<"}Previous</Button>
                  </FormGroup>

                  <FormGroup style={{display: this.state.manualPage == 3 ? "block" : "none"}}>
                    <h2>Equations</h2>
                    <div className = "table-responsive">
                      <table className = "table mt-3" style={{textAlign: "center"}}>
                        <thead>
                          <tr>
                            <th>Description*</th>
                            <th>Equation*</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equations.map((x,i) =>
                            <tr key={x.key}>
                              <th scope = "row">
                                <Input type="text" id={x.key} name="DisplayName" value={devices[x.key].DisplayName} onChange={e=>this.handleEquationsChange(e)}/>
                              </th>
                              <td>
                                <Input type="text" id={x.key} name="Equation" value={devices[x.key].Equation} onChange={e=>this.handleEquationsChange(e)}/>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>   
                    <Button color="secondary" id="add" onClick={this.addEquation}><i className="fas fa-plus"></i> Add Equation</Button>
                    <br/><br/>
                    <Button color="success" className="pull-right mt-3" id="add" onClick={this.addButtonClicked}>Add Asset</Button>           
                    <Button color="link" className="pull-right mt-3 mr-3" id="prev" onClick={this.onClickPrev}>{"<"}Previous</Button>
                  </FormGroup>
                </Form>
              </div>
            </ModalBody>
          </Modal>
        </div>
      );
    }
}

export default AddAsset;
