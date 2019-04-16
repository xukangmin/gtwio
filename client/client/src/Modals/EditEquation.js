import React from 'react';
import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Tag } from 'antd';
import ContentEditable from "react-contenteditable";

class EditEquation extends React.Component {
  constructor(props) {
      super(props);
      this.parameter = props.parameter;
      this.asset = props.asset;

      this.state = {
          equation: props.equation,
          devices: [...new Set(props.devices.map(x=> x.Parameters[0].Tag))],
          parameters: props.parameters,
          html: props.equation,
          ModalOpen: false
      };
      this.contentEditable = React.createRef();

      this.ModalToggle = this.ModalToggle.bind(this);
      this.addButtonClicked = this.addButtonClicked.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.addParameter = this.addParameter.bind(this);
      this.addOperator = this.addOperator.bind(this);
      this.updateEquation = this.updateEquation.bind(this);
      this.updateEdit = this.updateEdit.bind(this);
      this.getCursor = this.getCursor.bind(this);
  }

  ModalToggle(){
    this.setState(prevState => ({
      ModalOpen: !prevState.ModalOpen
    }));
  }

  addButtonClicked(){
    let equation = this.state.html.replace(/<button class="btn btn-info m-1" contenteditable="false">/g,"[").replace(/<\/button>/g,"]");
    let data = {
      ParameterID: this.parameter,
      OriginalEquation: equation
    }
    this.props.dispatch(parameterActions.updateParameter(this.asset, data));
    this.setState(prevState => ({
      equation: equation,
      ModalOpen: !prevState.ModalOpen
    }));
  }

  cancelButtonClicked(){
    this.setState(prevState => ({
      html: this.state.equation,
      ModalOpen: !prevState.ModalOpen
    }));
  }

  addParameter(e){  
    let newParameter = document.createElement('button');
    newParameter.classList.add("btn", "btn-info", "m-1");
    newParameter.setAttribute("contenteditable", "false")
    newParameter.appendChild(document.createTextNode(e.target.getAttribute('value')));

    this.anchor.insertNode(newParameter);
    this.anchor.setStart(document.getElementById('equationEdit'),this.anchor.startOffset+1);
  }

  addOperator(e){  
    this.anchor.insertNode(document.createTextNode(e.target.getAttribute('value')));
  }

  updateEquation(){
    this.setState({
      html: this.state.html.replace(/\[/g,"<button class='btn btn-info m-1' contenteditable='false'>").replace(/\]/g,"</button>")
    });
  }

  updateEdit(e){
    this.setState({
      html: e.target.value
    });
  }

  getCursor(e){  
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
        }
    } 
    this.anchor = range;
  }

  componentDidMount(){
    this.updateEquation();
  }
  
  render() {
    const devices = this.state.devices;
    const parameters = this.state.parameters;
    const operators = [
      { Name: 'Avg'},
      { Name: 'sqrt'},
      { Name: 'log'},
      { Name: '('},
      { Name: ')'},
      { Name: '+'}, 
      { Name: '-'}, 
      { Name: '*'}, 
      { Name: '/'}
    ];

    return(
      <div>
        <p onClick={this.ModalToggle}>{this.state.equation}</p>
        <Modal isOpen={this.state.ModalOpen} toggle={this.ModalToggle} style={{maxWidth: "1000px"}}>
          <ModalHeader toggle={this.ModalToggle}>Edit Equation</ModalHeader>
          <ModalBody>
            <Row>
              <Col md="8">
                <ContentEditable
                  id="equationEdit"
                  className="form-control"
                  style={{fontSize: '1.2rem', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '5 10', minHeight: '200px'}} 
                  html={this.state.html} 
                  disabled={false}       
                  onChange={this.updateEdit}
                  onKeyDown={this.getCursor}
                  onMouseDown={this.getCursor}
                  onKeyUp={this.getCursor}
                  onMouseUp={this.getCursor}
                />
                <div align="right" className="mt-3">
                  <Button color="success" id="submit" onClick={this.addButtonClicked}>Submit</Button>{' '}
                  <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
                </div>                
              </Col>
              <Col md="4">
                <div>
                  <h5>Group Data</h5>
                  {devices.map((x,i)=><Tag className="mb-2" onClick={this.addParameter} value={x} key={i}>{x}</Tag>)}
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
        </Modal>
      </div>
    );
  }
}

export default EditEquation;
