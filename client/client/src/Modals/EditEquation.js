import React from 'react';
import { connect } from 'react-redux';

import { parameterActions } from '../_actions/parameterAction';
import { Button, Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { Tag, Icon } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
const math = require('mathjs');

require('../Functions/noNewline.js');
require('codemirror/lib/codemirror.css');
require('../Style/equation.css');

class EditEquation extends React.Component {
  constructor(props) {
      super(props);
      this.asset = props.asset;
      this.user = props.user;
      this.instance = null;
 
      this.state = {
          parameter: props.item,
          equation: props.equation,
          value: props.equation,
          valid: true,
          modalOpen: false,
          options: {
            theme: 'gtw',
            lineNumbers: false,
            lineWrapping: true,
            noNewlines: true
          },
          token: null,
          cursor: null
      };

      this.modalToggle = this.modalToggle.bind(this);
      this.addText = this.addText.bind(this);
      this.validate = this.validate.bind(this);
      this.addButtonClicked = this.addButtonClicked.bind(this);
      this.cancelButtonClicked = this.cancelButtonClicked.bind(this);      
  }

  addText(text) {
    if (!this.state.cursor || !this.state.token){
      this.instance.setCursor({line: 0 , ch: 0});
    }
    this.setState({        
      value: this.state.value.substring(0,this.state.cursor.ch) + text + this.state.value.substring(this.state.cursor.ch)
    });
  }

  validate(text){
    let toValidate = text.replace(/\[(.*?)\]/gm, "0.1");
    this.setState({valid: true});
    try{
      let parser = math.parser();

      parser.set('Avg', function (...args) {
        return math.mean(...args);
      });

      parser.set('avg', function (...args) {
        return math.mean(...args);
      });

      parser.set('t_value', function (X, df) {
        return X/2+df;
      });
      
      parser.set('count', function (...args) {
        return args.length;
      });

      parser.eval(toValidate);
    }
    catch {
      this.setState({valid: false})
    }
  }

  modalToggle(){
    this.setState(prevState => ({
      modalOpen: !prevState.modalOpen
    }));
  }

  addButtonClicked(){
    let data = {
      'ParameterID': this.state.parameter,
      'OriginalEquation': this.state.value
    };    
    this.props.dispatch(parameterActions.updateParameter(this.asset, data));
    this.setState(prevState => ({
      equation: this.state.value,
      modalOpen: !prevState.modalOpen
    }));
  }

  cancelButtonClicked(){
    this.setState(prevState => ({
      value: this.state.equation,
      modalOpen: !prevState.modalOpen
    }));
  }
  
  render() {
    let devices, parameters;
    if (this.props.devices && this.props.parameters){
      devices = [...new Set(this.props.devices.map(x=> x.Parameters[0].Tag))];
      parameters = this.props.parameters;
    }
    
    const operators = [
      { Name: '('},
      { Name: ')'},
      { Name: '+'}, 
      { Name: '-'}, 
      { Name: '*'}, 
      { Name: '/'},
      { Name: '^'},
      { Name: 'Avg'},
      { Name: 'sum'},
      { Name: 'count'},
      { Name: 'sqrt'},
      { Name: 'log'},
      { Name: 'abs'},
      { Name: 'std'},
      { Name: 't_value'}
    ];

    return(
      <div>         
        <span onClick={this.modalToggle}>{this.state.equation}</span>
        { (devices && parameters) &&
        <Modal isOpen={this.state.modalOpen} toggle={this.modalToggle} style={{maxWidth: '1280px', overflowY: 'initial !important'}}>
          <ModalHeader toggle={this.modalToggle}>Edit Equation</ModalHeader>
          <ModalBody style={{height: 'calc(100vh - 200px)'}}>
            <Row>
              <Col md="7">
                <div style={{fontSize: '0.9rem', border: this.state.valid ? '1px solid #d9d9d9' : '1px solid red', borderRadius: '4px', padding: '5 10', position: "relative"}} >
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
                    onChange={(editor, data, value) => {                      
                      this.validate(value);
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
                      this.state.cursor = this.instance.getCursor();         
                      this.state.token = this.instance.getTokenAt({line: 0, ch: this.state.cursor.ch});
                    }}          
                  />
                {this.state.valid ? 
                <Tag align="right" color="green" style={{color: "green", position: "absolute", right: 0, bottom: 10, fontWeight: "bold"}}><Icon type="check-circle" /> Valid Equation</Tag> 
                :
                <Tag align="right" color="red" style={{color: "red", position: "absolute", right: 0, bottom: 10, fontWeight: "bold"}}><Icon type="exclamation-circle" /> Invalid Equation</Tag>
                }
                </div>  
                
                <div align="right" className="mt-3">
                  <Button color="success" id="submit" disabled={!this.state.valid} onClick={this.addButtonClicked}>Submit</Button>{' '}
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
                <hr/>
                <div>
                  <h5>Operators</h5>
                  {operators.map((x,i)=><Tag className="mb-2" onClick={()=>this.addText(x.Name)} value={x.Name} key={i}>{x.Name}</Tag>)}
                </div>
              </Col>
            </Row>                
          </ModalBody>
        </Modal>}        
      </div>
    );
  }
}

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

function mapStateToProps(state) {
  const { data } = state.data;
  const parameter = state.parameter.single;

  return {
      parameterData: data,
      parameter: parameter,
      devices: state.device.all,
      parameters: state.parameter.all
  };
}

const connectedPage = connect(mapStateToProps)(EditEquation);
export { connectedPage as EditEquation };
