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

        let equation = props.equation;
        this.state = {
            devices: props.devices,
            parameters: props.parameters,
            equation: equation,
            ModalOpen: false
        };

        this.ModalToggle = this.ModalToggle.bind(this);
        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.addParameter = this.addParameter.bind(this);
        this.addOperator = this.addOperator.bind(this);
        this.updateCode = this.updateCode.bind(this);
        this.updateEdit = this.updateEdit.bind(this);
    }

    ModalToggle(){
      this.setState(prevState => ({
        ModalOpen: !prevState.ModalOpen
      }));
    }

    addButtonClicked(){
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
        equation: this.state.equation + "&nbsp<span class='badge badge-info badge-pill contentEditable='false''>" + x.target.getAttribute('value') + "</span>&nbsp"
      });
      // this.updateCode();
    }

    addOperator(x){  
      console.log(x)    
      console.log(x.target.getAttribute('value'))
      this.setState({
        equation: this.state.equation + x.target.getAttribute('value')
      });
      // this.updateCode();
    }

    updateCode(){
      this.setState({
        equation: this.state.equation.replace(/\[/g,"<span class='badge badge-info badge-pill'>").replace(/\]/g,"</span>")
      });
      console.log('state'+this.state.equation)
    }

    updateEdit(x){
      console.log(x.target.getAttribute('value'))
      this.setState({
        equation: x.target.getAttribute('value')
      })
      console.log(this.state.equation)
    }

    componentDidMount(){
      this.updateCode();
      console.log(this.state.equation)
    }
    
    render() {
        const devices = this.state.devices;
        const parameters = this.state.parameters;
        const operators = [{Name: 'Avg'},{Name: '('},{Name: ')'},{Name: '+'}, {Name:'-'}]

        return(

          
          <div>
            <span onClick={this.ModalToggle}>{this.state.equation}</span>
            <Modal isOpen={this.state.ModalOpen} toggle={this.ModalToggle} style={{maxWidth: "750px"}}>
              <ModalHeader toggle={this.ModalToggle}>Edit Equation</ModalHeader>
              <ModalBody>
                <Row>
                  <Col>
                    <Label for="equation">Equation</Label>
                    <div>
                     
                    
                   

                    </div>
                    <div >
                    </div>
                    <div onBlur={this.updateEdit} value={this.state.equation} contentEditable dangerouslySetInnerHTML={{__html: this.state.equation}}></div>
                    </Col>
                  <Col>
                    <div>
                      <h3>Group Data</h3>
                        {devices.map((x,i)=>
                          <Tag onClick={this.addParameter} value={x.Parameters[0].Tag} key={i}>{x.Parameters[0].Tag}</Tag>)}
                    </div>
                    <hr/>
                    <div>
                      <h3>Parameters</h3>
                      {parameters.map((x,i)=><Tag onClick={this.addParameter} value={x.Tag} key={i}>{x.Tag}</Tag>)}
                    </div>

                    <div>
                      <h3>Operators</h3>
                      {operators.map((x,i)=><Tag onClick={this.addOperator} value={x.Name} key={i}>{x.Name}</Tag>)}
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
