import React from 'react';
import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Tag } from 'antd';

class EditEquation extends React.Component {
  constructor(props) {
      super(props);
      this.contentEditable = React.createRef();
      this.parameter = props.parameter;

      this.state = {
          equation: props.equation,
          devices: props.devices,
          parameters: props.parameters,
          html: props.equation,
          ModalOpen: false
      };

      this.ModalToggle = this.ModalToggle.bind(this);
      this.addButtonClicked = this.addButtonClicked.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.addParameter = this.addParameter.bind(this);
      this.addOperator = this.addOperator.bind(this);
      this.updateEquation = this.updateEquation.bind(this);
      this.updateEdit = this.updateEdit.bind(this);
      this.getCursor = this.getCursor.bind(this);
      this.setCursor = this.setCursor.bind(this);
  }

  ModalToggle(){
    this.setState(prevState => ({
      ModalOpen: !prevState.ModalOpen
    }));
  }

  addButtonClicked(){
    let equation = this.state.html.replace(/<button class='btn btn-info m-1' contenteditable='false'>/g,"[").replace(/<\/button>/g,"]");
    let data = {
      ParameterID: this.parameter,
      OriginalEquation: equation
    }
    console.log(data)
    this.props.dispatch(parameterActions.updateParameter(data));
    this.setState(prevState => ({
      ModalOpen: !prevState.ModalOpen
    }));
  }

  cancelButtonClicked(){
    this.setState(prevState => ({
      html: this.state.equation,
      ModalOpen: !prevState.ModalOpen
    }));
  }

  addParameter(x){  
    this.setState({
      html: this.state.html + "<button class='btn btn-info m-1' contenteditable='false'>" + x.target.getAttribute('value') + "</button>"
    });
  }

  addOperator(x){  
    this.setState({
      html: this.state.html + x.target.getAttribute('value')
    });
  }

  updateEquation(){
    this.setState({
      html: this.state.html.replace(/\[/g,"<button class='btn btn-info m-1' contenteditable='false'>").replace(/\]/g,"</button>")
    });
  }

  updateEdit(e){
    console.log(e.target.innerText)
    this.setState({
      html: e.target.value
    });
    // console.log(this.getCursor())
    // this.setCursor(this.getCursor());
  }

  getCursor(){  
    // console.log(window.getSelection().getRangeAt(0))
    // this.cursor = window.getSelection().getRangeAt(0);
    // return window.getSelection().getRangeAt(0);
  }

  setCursor(chars) {
    // console.log(chars);
    // window.getSelection().removeAllRanges();
    // window.getSelection().addRange(chars);
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
          <ModalHeader toggle={this.ModalToggle}>Edit Equation</ModalHeader>
          <ModalBody>
            <Row>
              <Col md="8">
                <div id="editEquation" 
                    style={{fontSize: '1.2rem', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '5 10', minHeight: '200px'}} 
                    onInput={this.updateEdit} 
                    contentEditable 
                    dangerouslySetInnerHTML={{__html: this.state.html}}>
                </div>
                <div align="right" className="mt-3">
                  <Button color="success" id="submit" onClick={this.addButtonClicked}>Submit</Button>{' '}
                  <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
                </div>
                
              </Col>
              <Col md="4">
                <div>
                  <h5>Group Data</h5>
                  {devices.map((x,i)=><Tag className="mb-2" id={'x'+i} onClick={this.addParameter} value={x.Parameters[0].Tag} key={i}>{x.Parameters[0].Tag}</Tag>)}
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
