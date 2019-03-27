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
            Devices: [{key: 0, SerialNumber: ""}],
            Equations: [{key: 0, Equation: ""}]
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.handleAddType = this.handleAddType.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleInfoChange = this.handleInfoChange.bind(this);
        this.handleDevicesChange = this.handleDevicesChange.bind(this);
        this.addDevice = this.addDevice.bind(this);
        this.onClickNext = this.onClickNext.bind(this);
    }

    addModalToggle(t){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    addButtonClicked(){
      
        // this.props.dispatch(assetActions.addAsset(this.props.user,this.state.displayname, this.state.location));
      
        // this.props.dispatch(assetActions.createAssetByConfig(this.props.user, this.state.templateContent));
      

      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }
  
    handleAddType(e){
      this.setState({
        addType: e.target.name
      });
    }

    handleUploadFile(e) {
      e.preventDefault();
  
      let data = new FormData();
      data.append('configFile', this.uploadInput.files[0]);
      data.append('UserID', this.user);
      console.log(data);
      fetch('http://localhost:8002/asset/createAssetByConfigFile', {
        method: 'POST',
        body: data,
      }).then((response) => {
        response.json().then((body) => {
          //action
          //this.setState({ imageURL: `http://localhost:8000/${body.file}` });
          console.log(body);
          
        });
      });
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

    // onClickPrev(){
    //   let currentPage = this.state.manualPage;
    //   this.setState({
    //     manualPage: currentPage - 1
    //   });
    // }
    addDevice(){
      this.setState((prevState) => ({
        Devices: [...prevState.Devices, {key: this.state.Devices.length, SerialNumber:""}],
      }));
      console.log(this.state.Devices);
    }

    handleDevicesChange(e){
      let devices = [...this.state.Devices]
      devices[e.target.id][e.target.name] = e.target.value
      this.setState({ devices }, () => console.log(this.state.devices));
    }

    render() {
      let devices = this.state.Devices;
        return(
          <div>
            <Button color="primary" name="addButton" onClick={e=>this.addModalToggle(e)}>Add New Asset</Button>
                   
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle} style={{maxWidth: "850px"}}>
              <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
              <ModalBody>
                <Form>
                    <div className="mb-2" style={{textAlign: "center"}}>
                      <Button color={this.state.addType == "import" ? "primary" : "light"} name="import" className="mr-3" onClick={(e)=>this.handleAddType(e)}>Import Configuration File</Button>
                      <Button color={this.state.addType == "manual" ? "primary" : "light"} name="manual" onClick={(e)=>this.handleAddType(e)}>Add Manually</Button>
                    </div>     
                </Form>

                <div className="py-5 px-3" style={{border: "1px solid #dee2e6"}}>
                  
                  <Form onSubmit={this.handleUploadFile} style={{display: this.state.addType == "import" ? "block" : "none"}}>
                    <div style={{textAlign: "right"}}>
                      <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept='.json' />
                    </div>
                    <br />
                    <div>
                      <Button color="primary pull-right mt-2">Upload</Button>
                    </div>
                  </Form>

                  <Form onSubmit={this.handleUploadFile} style={{display: this.state.addType == "manual" ? "block" : "none"}} >
                    
                    <FormGroup style={{display: this.state.manualPage == 1 ? "block" : "none"}}>
                      <Row>
                      <Col>
                      <Label for="assetName"><strong>Asset Name*</strong></Label>
                      <Input type="text" id="assetName" name="DisplayName" value={this.state.DisplayName} onChange={e=>this.handleInfoChange(e)}/>
                      
                      </Col>
                      </Row>
                      <Row>
                      <Col>
                      <Label for="location">Location</Label>
                      <Input type="text" id="location" name="Location" value={this.state.Location} onChange={e=>this.handleInfoChange(e)}/>
                      
                      </Col>

                      </Row>
                      
                      <Button color="primary" className="pull-right mt-3" id="next" onClick={this.onClickNext}>Next</Button>{' '}
                    </FormGroup>
                   
                    <FormGroup style={{display: this.state.manualPage == 2 ? "block" : "none"}} >
                    {devices.map((x)=>
                    <div key={x.key}>
                      <Row>
                        <Col md="2">
                          <Label for="serialNumber"><strong>Serial Number*</strong></Label>
                          <Input type="text" id={x.key} name="SerialNumber" value={devices[x.key].SerialNumber} onChange={e=>this.handleDevicesChange(e)}/>
            
                        </Col>

                        <Col md="3">
                          <Label for="DisplayName"><strong>Description</strong></Label>
                          <Input type="text" id={x.key} name="DisplayName" value={devices[x.key].DisplayName} onChange={e=>this.handleDevicesChange(e)}/>
                          
                        </Col>
                          <Col md="2">
                            <Label for="Type">Type</Label>
                            <Input type="select" id={x.key} name="Parameter" value={devices[x.key].Parameter} onChange={e=>this.handleDevicesChange(e)}>
                              <option value="Temp">Temperature</option>
                              <option value="Flowrate">Flow Rate</option>
                            </Input>  
                          </Col>
                          <Col md="2">
                            <Label for="Location">Location</Label>
                            <Input type="select" id={x.key} name="Location" value={devices[x.key].Location} onChange={e=>this.handleDevicesChange(e)}>
                              <option value="TubeInlet">TubeInlet</option>
                              <option value="Flowrate">Flow Rate</option>
                            </Input>
                            </Col>
                            <Col md="2">
                            <Label for="Angle">Angle</Label>
                            <Input type="select" id={x.key} name="Angle" value={devices[x.key].Angle} onChange={e=>this.handleDevicesChange(e)}>
                              <option value="Temp">Temperature</option>
                              <option value="Flowrate">Flow Rate</option>
                            </Input>
                          </Col>
                      
                      </Row>

                    </div>)}                   
                      
                      <Button color="primary" id="add" onClick={this.addDevice}>Add Device</Button>

                      
                      
                      
                     
                    </FormGroup>

                    <FormGroup style={{display: this.state.manualPage == 3 ? "block" : "none"}}>
                      <Button color="primary" id="add" onClick={this.addButtonClicked}>Add</Button>{' '}
                      <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
                    </FormGroup>

                    
                   
                  </Form>

                  

                </div>
                

              </ModalBody>
            </Modal>
          </div>
        );
    }
}

export default AddAsset
