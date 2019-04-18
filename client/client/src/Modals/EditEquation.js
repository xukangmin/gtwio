import React from 'react';
import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { Tag } from 'antd';
import {Controlled as CodeMirror} from 'react-codemirror2';

require('codemirror/lib/codemirror.css');
require('../Style/equation.css');

let sampleMode = () => {
  return {
    startState: function () {
      return {inString: false};
    },
    token: function (stream, state) {
      // If a string starts here
      //console.log(stream);
      if (!state.inString && stream.peek() === '[') {
        stream.next();            // Skip quote
        state.inString = true;    // Update state
      }

      if (state.inString) {
        if (stream.skipTo(']')) { // Quote found on this line
          stream.next();          // Skip quote
          state.inString = false; // Clear flag
        } else {
          stream.skipToEnd();    // Rest of line is string
        }
        return "parameter";          // Token style
      } else {
        stream.skipTo('[') || stream.skipToEnd();
        return null;              // Unstyled token
      }
    }
  };
};

class EditEquation extends React.Component {
  constructor(props) {
      super(props);

      this.parameter = props.parameter;
      this.asset = props.asset;
      this.instance = null;

      this.state = {
          equation: props.equation,
          devices: [...new Set(props.devices.map(x=> x.Parameters[0].Tag))],
          parameters: props.parameters,
          value: props.equation,
          ModalOpen: false,
          options: {
            theme: 'gtw',
            lineNumbers: false,
            lineWrapping: true
          },
          token: null,
          cursor: null,
          Pos : {}
      };
      
      this.contentEditable = React.createRef();

      this.ModalToggle = this.ModalToggle.bind(this);
      this.addButtonClicked = this.addButtonClicked.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
      this.addText = this.addText.bind(this);
  }

  addText(text) {
    this.setState(prevState => 
      {
        return {
          value: prevState.value.substring(0,prevState.Pos.ch) + text + prevState.value.substring(prevState.Pos.ch)
        };
      });
  }

  ModalToggle(){
    this.setState(prevState => ({
      ModalOpen: !prevState.ModalOpen
    }));
  }

  addButtonClicked(){
    let data = {
      ParameterID: this.parameter,
      OriginalEquation: this.state.value
    }
    this.props.dispatch(parameterActions.updateParameter(this.asset, data));
    this.setState(prevState => ({
      equation: this.state.value,
      ModalOpen: !prevState.ModalOpen
    }));
  }

  cancelButtonClicked(){
    this.setState(prevState => ({
      value: this.state.equation,
      ModalOpen: !prevState.ModalOpen
    }));
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
        <span onClick={this.ModalToggle}>{this.state.equation}</span>
        <Modal isOpen={this.state.ModalOpen} toggle={this.ModalToggle} style={{maxWidth: '1280px', overflowY: 'initial !important'}}>
          <ModalHeader toggle={this.ModalToggle}>Edit Equation</ModalHeader>
          <ModalBody style={{height: 'calc(100vh - 200px)'}}>
            <Row>
              <Col md="7">
                <div style={{fontSize: '1.1rem', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '5 10'}} >
                  <CodeMirror                    
                    value={this.state.value}
                    editorDidMount={(editor) => {
                      this.instance = editor; 
                    }}
                    defineMode={{name: 'parameters', fn: sampleMode}}
                    options={this.state.options}
                    onBeforeChange={(editor, data, value) => {
                      this.setState({value});
                    }}
                    onKeyDown={(cm, e)=>{
                      this.state.cursor = this.instance.getCursor();         
                      this.state.token = this.instance.getTokenAt({line: 0, ch: e.keyCode == 46 ? this.state.cursor.ch + 1 : this.state.cursor.ch});

                      if( e.keyCode == 8 || e.keyCode == 46 ) {
                        if (this.state.token && (this.state.token.string.includes("[") || this.state.token.string.includes("]"))){
                          this.setState(prevState => {
                            return {
                              value: prevState.value.substring(0, prevState.token.start) + prevState.value.substring(prevState.token.end)
                            };
                          });
                          this.instance.setCursor({line: this.state.cursor.line , ch:this.state.token.start});
                        }            
                      }
                    }}
                    onCursor={(editor, data) => {            
                      this.setState({Pos: data});
                    }}          
                  />
                </div>   
                <div align="right" className="mt-3">
                  <Button color="success" id="submit" onClick={this.addButtonClicked}>Submit</Button>{' '}
                  <Button color="secondary" id="cancel" onClick={this.cancelButtonClicked}>Cancel</Button>
                </div>                
              </Col>
              <Col md="5" style={{height: 'calc(100vh - 220px)', overflowY: 'scroll'}}>
                <div>
                  <h5>Group Data</h5>
                  {devices.map((x,i)=><Tag className="mb-2" onClick={()=>this.addText('['+x+']')} value={x} key={i}>{x}</Tag>)}
                </div>
                <hr/>
                <div>
                  <h5>Parameters</h5>
                  {parameters.map((x,i)=><Tag className="mb-2" onClick={()=>this.addText('['+x.Tag+']')} value={x.Tag} key={i}>{x.Tag}</Tag>)}
                </div>
                <div style={{display: "none"}}>
                  <h5>Operators</h5>
                  {operators.map((x,i)=><Tag className="mb-2" onClick={()=>this.addText(x.Name)} value={x.Name} key={i}>{x.Name}</Tag>)}
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
