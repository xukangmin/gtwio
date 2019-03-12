import React from 'react';
import { parameterActions } from '../../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class AddNewParameter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: '',
            equation: '',
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
        Equation: this.state.equation
      }
      this.props.dispatch(parameterActions.addNewParameter(this.props.asset, newParameter.DisplayName, newParameter.Equation));
      this.setState(prevState => ({
        displayName: '',
        equation: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        displayName: '',
        equation: '',
        addModalOpen: !prevState.addModalOpen
      }));
    }

    handleChange(event) {
      const { name, value } = event.target;
      this.setState({ [name]: value});
    }

    render() {
        const { displayName, equation } = this.state;

        return(
          <div>
            <Button color="primary" onClick={this.addModalToggle}>Add New Parameter</Button>
            <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Add New Parameter</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="displayName">Name</Label>
                    <Input type="text" id="displayname" name="displayName" value={displayName} onChange={this.handleChange}/>
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

export default AddNewParameter;
