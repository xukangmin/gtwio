import React from 'react';
import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Tag } from 'antd';
import ContentEditable from 'react-contenteditable';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import Markdown from 'react-mark';

class EditEquation extends React.Component {
    constructor(props) {
        super(props);
        this.contentEditable = React.createRef();

        this.state = {
            equation: props.equation,
            devices: props.devices,
            parameters: props.parameters,
            equationToEdit: props.equation,
            ModalOpen: false
        };

        this.ModalToggle = this.ModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.addParameter = this.addParameter.bind(this);
        this.addOperator = this.addOperator.bind(this);
        this.updateEquation = this.updateEquation.bind(this);
        this.updateEdit = this.updateEdit.bind(this);
    }

    ModalToggle(){
      this.setState(prevState => ({
        ModalOpen: !prevState.ModalOpen
      }));
    }

    addButtonClicked(){
      console.log(this.state.equationToEdit.replace(/<button class='btn btn-info m-1'>/g,"[").replace(/<\/button>/g,"]"))
      console.log(this.state.equationToEdit)
      let newParameter = this.state.equationToEdit.replace(/<button class='btn btn-info m-1'>/g,"[").replace(/<\/button>/g,"]");
      this.props.dispatch(parameterActions.addParameter(this.props.asset, newParameter));
      this.setState(prevState => ({
        ModalOpen: !prevState.ModalOpen
      }));
    }

    cancelButtonClicked(){
      this.setState(prevState => ({
        ModalOpen: !prevState.ModalOpen
      }));
    }

    addParameter(x){  
      console.log(x)    
      console.log(x.target.getAttribute('value'))
      this.setState({
        equationToEdit: this.state.equationToEdit + "<button class='btn btn-info m-1'>" + x.target.getAttribute('value') + "</button>"
      });
      // this.updateEquation();
    }

    addOperator(x){  
      console.log(x)    
      console.log(x.target.getAttribute('value'))
      this.setState({
        equationToEdit: this.state.equationToEdit + x.target.getAttribute('value')
      });
      // this.updateEquation();
    }

    updateEquation(){
      this.setState({
        equationToEdit: this.state.equationToEdit.replace(/\[/g,"<button class='btn btn-info m-1'>").replace(/\]/g,"</button>")
      });
      console.log('state'+this.state.equationToEdit)
    }

    updateEdit(){
      console.log('input')
      
      this.setState({
        equationToEdit: document.getElementById('editEquation').innerHTML
      })
      console.log(this.state.equationToEdit)
    }

    componentDidMount(){
      this.updateEquation();
    }
    
    render() {
        const devices = this.state.devices;
        const parameters = this.state.parameters;
        const operators = [{Name: 'Avg'},{Name: 'sqrt'},{Name: 'log'},{Name: '('},{Name: ')'},{Name: '+'}, {Name:'-'}, {Name:'*'}, {Name:'/'}]

        return(
          <div>
            <span onClick={this.ModalToggle}>{this.state.equation}</span>
            <Modal isOpen={this.state.ModalOpen} toggle={this.ModalToggle} style={{maxWidth: "1000px"}}>
              <ModalHeader toggle={this.ModalToggle}></ModalHeader>
              <ModalBody>
                <Row>
                  <Col md="8">
                    <Label for="equation"><h5>Edit Equation</h5></Label> 
                    <div id="editEquation" style={{fontSize: '1.2rem', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '5px'}} onInput={this.updateEdit} contentEditable dangerouslySetInnerHTML={{__html: this.state.equationToEdit}}></div>
                  </Col>
                  <Col md="4">
                    <div>
                      <h5>Group Data</h5>
                      {devices.map((x,i)=><Tag className="mb-2" onClick={this.addParameter} value={x.Parameters[0].Tag} key={i}>{x.Parameters[0].Tag}</Tag>)}
                    </div>
                    <hr/>
                    <div>
                      <h5>Parameters</h5>
                      {parameters.map((x,i)=><Tag className="mb-2" onClick={this.addParameter} value={x.Tag} key={i}>{x.Tag}</Tag>)}
                    </div>
                    <hr/>
                    <div>
                      <h5>Operators</h5>
                      {operators.map((x,i)=><Tag className="mb-2" onClick={this.addOperator} value={x.Name} key={i}>{x.Name}</Tag>)}
                    </div>
                  </Col>
                </Row>                
              </ModalBody>
              <ModalFooter>
                <Button color="success" id="submit" onClick={this.addButtonClicked}>Submit</Button>{' '}
                <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
              </ModalFooter>
            </Modal>
          </div>
        );
    }
}

export default EditEquation;
