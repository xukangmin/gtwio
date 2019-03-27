import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import template from '../Data/config';
import Stepper from 'react-stepper-horizontal';


class AddAsset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayname: '',
            location: '',
            addModalOpen: false,
            templateContent: template,
            
            steps: [{
              title: 'Asset Info',
              onClick: (e) => {
                this.setState({currentStep:0})
                e.preventDefault()
                console.log('onClick', 1)
              }
            }, {
              title: 'Add Devices',
              onClick: (e) => {
                this.setState({currentStep:1})
                e.preventDefault()
                console.log('onClick', 2)
              }
            }, {
              title: 'Add Equations',
              onClick: (e) => {
                this.setState({currentStep:2})
                e.preventDefault()
                console.log('onClick', 3)
              }
            }],
            currentStep: 0,
        };

        this.onClickNext = this.onClickNext.bind(this);

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateTemplate = this.updateTemplate.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        
    }

    onClickNext() {
      const { steps, currentStep } = this.state;
      this.setState({
        currentStep: currentStep + 1,
      });
    }


    addModalToggle(t){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
      this.setState({type: t.target.name});
    }

    addButtonClicked(){
      
        // this.props.dispatch(assetActions.addAsset(this.props.user,this.state.displayname, this.state.location));
      
        // this.props.dispatch(assetActions.createAssetByConfig(this.props.user, this.state.templateContent));
      

      this.setState(prevState => ({
        displayname: '',
        location: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        displayname: '',
        location: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState( { [name]: value} );
    }

    updateTemplate(e){
      this.setState({templateContent: JSON.parse(e.target.value)});
    }
    

    handleUploadImage(ev) {
      ev.preventDefault();
  
      const data = new FormData();
      data.append('configFile', this.uploadInput.files[0]);
      data.append('UserID', 'USERID0');
      fetch('http://localhost:8002/asset/createAssetByConfigFile', {
        method: 'POST',
        body: data,
      }).then((response) => {
        response.json().then((body) => {
          //this.setState({ imageURL: `http://localhost:8000/${body.file}` });
          console.log(body);
          
        });
      });
      
    }

    render() {
        const { displayname } = this.state;
        const { steps, currentStep } = this.state;
    const buttonStyle = { background: '#E0E0E0', width: 200, padding: 16, textAlign: 'center', margin: '0 auto', marginTop: 32 };

        return(
          <div>
            <Button color="primary" name="addButton" onClick={e=>this.addModalToggle(e)}>Add New Asset</Button>
            <form onSubmit={this.handleUploadImage}>
              <div>
                <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept='.json' />
              </div>
              <br />
              <div>
                <button>Upload</button>
              </div>
            </form>

            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                  <div>
                    <Stepper steps={ steps } activeStep={ currentStep } className="mb-2"/>
                    <hr/>
                    
                    <div className="step1" style={{display: this.state.currentStep == 0 ? "block" : "none"}}>
                      <Label for="displayname"><strong>Asset Name*</strong></Label>
                      <Input type="text" id="displayname" name="displayname" value={this.state.displayname} onChange={this.handleChange}/>
                      <br/>
                      <Label for="location">Location</Label>
                      <Input type="text" id="location" name="location" value={this.state.location} onChange={this.handleChange}/>
                    </div>

                    <div className="step2" style={{display: this.state.currentStep == 1 ? "block" : "none"}}>
                      <Label for="displayname"><strong>Serial Number*</strong></Label>
                      <Input type="text" id="displayname" name="displayname" value={this.state.displayname} onChange={this.handleChange}/>
                      <br/>
                      <Label for="location">Description</Label>
                      <Input type="text" id="location" name="location" value={this.state.location} onChange={this.handleChange}/>

                      <Label for="location">Type</Label>
                      <Input type="select" value={this.state.type} onChange={(e)=>this.handleChange(e)}>
                        <option value="Temp">Temperature</option>
                        <option value="Flowrate">Flow Rate</option>
                      </Input>

                      <Label for="location">Location</Label>
                      <Input type="select" value={this.state.type} onChange={(e)=>this.handleChange(e)}>
                        <option value="Temp">Temperature</option>
                        <option value="Flowrate">Flow Rate</option>
                      </Input>

                      <Label for="location">Angle</Label>
                      <Input type="select" value={this.state.type} onChange={(e)=>this.handleChange(e)}>
                        <option value="Temp">Temperature</option>
                        <option value="Flowrate">Flow Rate</option>
                      </Input>
                    </div>

                    <div className="step3" style={{display: this.state.currentStep == 2 ? "block" : "none"}}>
                      <Label for="displayname">Equation</Label>
                      <Input type="text" id="displayname" name="displayname" value={this.state.displayname} onChange={this.handleChange}/>
                      <br/>
                      <Label for="location">Location</Label>
                      <Input type="text" id="location" name="location" value={this.state.location} onChange={this.handleChange}/>
                    </div>
                  </div>

                    
                  </FormGroup>
                </Form>

              </ModalBody>

              <ModalFooter>
                <Button color="primary" id="add" onClick={this.onClickNext}>Next</Button>{' '}
                <Button color="primary" id="add" onClick={this.addButtonClicked}>Add</Button>{' '}
                <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
              </ModalFooter>
            </Modal>
          </div>
        );
    }
}

export default AddAsset
