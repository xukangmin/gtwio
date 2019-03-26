import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import template from '../Data/config';
import { Steps } from 'antd';
const Step = Steps.Step;
import 'antd/dist/antd.css'


class AddNewAssets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayname: '',
            location: '',
            addModalOpen: false,
            templateContent: template,
            type: 'manual'
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateTemplate = this.updateTemplate.bind(this);
    }

    addModalToggle(t){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
      this.setState({type: t.target.name});
    }

    addButtonClicked(){
      if(this.state.type == "manual"){
        this.props.dispatch(assetActions.addAsset(this.props.user,this.state.displayname, this.state.location));
      } else {
        this.props.dispatch(assetActions.createAssetByConfig(this.props.user, this.state.templateContent));
      }

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

    render() {
        const { displayname } = this.state;

        return(
          <div>
            <Button color="primary" name="manual" onClick={e=>this.addModalToggle(e)}>Add Asset Manually</Button>
            <Button color="primary" name="template" onClick={e=>this.addModalToggle(e)} className="ml-3">Add Asset by Template</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
              <ModalBody>
                <Form style={{display: this.state.type == "manual" ? "block" : "none"}}>
                  <FormGroup>
                    <Label for="displayname">Asset Name</Label>
                    <Input type="text" id="displayname" name="displayname" value={this.state.displayname} onChange={this.handleChange}/>
                    <br/>
                    <Label for="location">Location</Label>
                    <Input type="text" id="location" name="location" value={this.state.location} onChange={this.handleChange}/>
                  </FormGroup>

                  <FormGroup>
                    <Label for="devices">Devices</Label>
                    <Input type="text" id="devices" name="devices" value={this.state.displayname} onChange={this.handleChange}/>
                    <br/>
                  </FormGroup>

                  <FormGroup>
                    <Label for="equations">Equations</Label>
                    <Input type="text" id="equations" name="equations" value={this.state.displayname} onChange={this.handleChange}/>
                    <br/>
                  </FormGroup>
                </Form>

                <Form style={{display: this.state.type == "template" ? "block" : "none"}}>
                  <Input type="textarea" rows="20" value={JSON.stringify(this.state.templateContent, null, 2)} onChange={this.updateTemplate}></Input>
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
