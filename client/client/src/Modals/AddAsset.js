import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Radio, Tag, Icon } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import { Controlled as CodeMirror } from 'react-codemirror2';
const math = require('mathjs');

require('../Functions/noNewline.js');
require('codemirror/lib/codemirror.css');
require('../Style/equation.css');

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
            Devices: [{
              key: 0, 
              SerialNumber: "",
              DisplayName: "",
              Parameters: "",
              Tag: "",
              Angle: ""
            }],
            Equations: [{
              key: 0, 
              Tag: "",
              DisplayName: "",
              Equation: "",
              Valid: true
            }],
            equationFocus: "",
            options: {
              theme: 'gtw',
              lineNumbers: false,
              lineWrapping: true,
              noNewlines: true,
              scrollbarStyle: null
            },
            token: null,
            cursor: null
        };

        this.addModalToggle = this.addModalToggle.bind(this);
        this.handleAddType = this.handleAddType.bind(this);

        this.addButtonClicked = this.addButtonClicked.bind(this);
        this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
        this.resetForm = this.resetForm.bind(this);
        
        this.handleUploadFile = this.handleUploadFile.bind(this);
        
        this.handleInfoChange = this.handleInfoChange.bind(this);
        this.handleDevicesChange = this.handleDevicesChange.bind(this);
        this.handleEquationsChange = this.handleEquationsChange.bind(this);
        
        this.addDevice = this.addDevice.bind(this);
        this.addEquation = this.addEquation.bind(this);
        
        this.onClickNext = this.onClickNext.bind(this);
        this.onClickPrev = this.onClickPrev.bind(this);
        
        this.addText = this.addText.bind(this);
        this.validate = this.validate.bind(this);
    }

    addModalToggle(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    resetForm(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));

      this.setState({
        addType: 'import',
        manualPage: 1,
        
        DisplayName: "",
        Location: "",
        Devices: [{
          key: 0, 
          SerialNumber: "",
          DisplayName: "",
          Parameters: "",
          Tag: "",
          Angle: ""
        }],
        Equations: [{
          key: 0, 
          Tag: "",
          DisplayName: "",
          Equation: "",
          Valid: true
        }],
        equationFocus: "",
        token: null,
        cursor: null        
      });
    }

    addButtonClicked(){
      if (this.state.addType == "manual"){
        let data = {
          AssetName: this.state.DisplayName,
          Location: this.state.Location,
          Devices: this.state.Devices,
          Equations: this.state.Equations
        };
        this.props.dispatch(assetActions.addAssetByConfig(this.user, data));
      }
      this.resetForm();
    }

    cancelButtonClicked(){
      this.resetForm();
    }
  
    handleAddType(e){
      this.setState({
        addType: e.target.value
      });
    }

    handleUploadFile(e) {
      let data = new FormData();
      data.append('configFile', this.uploadInput.files[0]);
      data.append('UserID', this.user.UserID);

      this.props.dispatch(assetActions.addAssetByConfigFile(this.user, data));
    }

    handleInfoChange(e){
      const { name, value } = event.target;
      this.setState({[name]: value}, () => console.log(this.state));
    }

    onClickNext(){
      let currentPage = this.state.manualPage;
      if (currentPage == 1 && this.state.DisplayName == ""){
        alert("Asset Name is required.");
      } else {
        this.setState({
          manualPage: currentPage + 1
        });
      }      
    }

    onClickPrev(){
      let currentPage = this.state.manualPage;
      this.setState({
        manualPage: currentPage - 1
      });
    }

    addDevice(){
      this.setState((prevState) => ({
        Devices: [...prevState.Devices, {
          key: this.state.Devices.length, 
          SerialNumber: "",
          DisplayName: "",
          Parameters: "",
          Tag: "",
          Angle: ""
        }],
      }));
    }

    handleDevicesChange(e){
      let devices = [...this.state.Devices]
      devices[e.target.id][e.target.name] = e.target.value
      this.setState({ devices }, () => console.log(this.state.devices));
    }

    addEquation(){
      this.setState((prevState) => ({
        Equations: [...prevState.Equations, {
          key: this.state.Equations.length, 
          Tag: "",
          DisplayName: "",
          Equation: "",
          Valid: true
        }],
      }));
    }

    handleEquationsChange(e){
      let equations = [...this.state.Equations]
      equations[e.target.id][e.target.name] = e.target.value
      this.setState({ equations }, () => console.log(this.state.equations));
    }

    handleCMChange(id, name, value){
      let Equations = [...this.state.Equations];
      Equations[id][name] = value;
      this.setState({ Equations }, () => console.log(this.state.Equations));
    }

    addText(text) {
      if (!this.state.cursor || !this.state.token){
        this.instance.setCursor({line: 0 , ch: 0});
      }
      let Equations = [...this.state.Equations];
      if(this.state.Equations[this.state.equationFocus].Equation){
        Equations[this.state.equationFocus].Equation = this.state.Equations[this.state.equationFocus].Equation.substring(0,this.state.cursor.ch) + text + this.state.Equations[this.state.equationFocus].Equation.substring(this.state.cursor.ch);
      } else {
        Equations[this.state.equationFocus].Equation = text;
      }
      this.setState({ Equations }, () => console.log(this.state.Equations));
    }
  
    validate(text){
      let toValidate = text.replace(/\[(.*?)\]/gm, "0.1");

      let Equations = [...this.state.Equations];
      Equations[this.state.equationFocus].Valid = true;
      this.setState({ Equations });
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
        Equations[this.state.equationFocus].Valid = false;
        this.setState({ Equations });
      }
    }

    render() {
      let devices = this.state.Devices;
      let groupData = [...new Set(this.state.Devices.filter(x=>x.Parameters && x.Tag).map(x=> x.Parameters + '/' + x.Tag))];
      let equations = this.state.Equations;
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
          <Button color="primary" name="addButton" onClick={e=>this.addModalToggle(e)}>Add New Asset</Button>
                  
          <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle} style={{maxWidth: "950px"}}>
            <ModalHeader toggle={this.addModalToggle}>Add New Asset</ModalHeader>
            <ModalBody>
              <Form>
                  <div className="mb-2" style={{textAlign: "center"}}>
                    <Radio.Group defaultValue={this.state.addType} onChange={(e)=>this.handleAddType(e)} buttonStyle="solid" size="large">
                      <Radio.Button value="import">Import Configuration File</Radio.Button>
                      <Radio.Button value="manual">Add Manually</Radio.Button>
                    </Radio.Group>                    
                  </div>     
              </Form>

              <div className="pb-5 pt-3 px-3" style={{border: "1px solid #dee2e6"}}>
                
                <Form className="mt-3" onSubmit={this.handleUploadFile} style={{display: this.state.addType == "import" ? "block" : "none"}}>
                  <div style={{textAlign: "center"}}>
                    <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept='.json' />
                  </div>
                  <br/><br/>
                  <div>
                    <Button color="success pull-right mt-2">Add Asset</Button>
                  </div>
                </Form>

                <Form style={{display: this.state.addType == "manual" ? "block" : "none"}} >
                  <Row>
                    <Col md="1"></Col>
                    <Col md="2" className="p-0 m-0 text-center">
                    <h3><Badge pill color="primary">1</Badge></h3>
                    <p>Asset Info</p>
                    </Col>
                    <Col md="2" className="p-0 m-0 text-center">
                      <hr/>
                    </Col>
                    <Col md="2" className="p-0 m-0 text-center">
                    <h3><Badge pill color={this.state.manualPage >= 2 ? "primary" : "light"}>2</Badge></h3>
                    <p>Add Devices</p>
                    </Col>
                    <Col md="2" className="p-0 m-0 text-center">
                      <hr/>
                    </Col>
                    <Col md="2" className="p-0 m-0 text-center">
                    <h3><Badge pill color={this.state.manualPage >= 3 ? "primary" : "light"}>3</Badge></h3>
                    <p>Add Equations</p>
                    </Col>
                    <Col md="1"></Col>
                  </Row>

                  <FormGroup style={{display: this.state.manualPage == 1 ? "block" : "none"}}>
                    <div className = "table-responsive">
                      <table className = "table mt-3" style={{textAlign: "center"}}>
                        <thead>
                          <tr>
                            <th>Asset Name*</th>
                            <td>Location</td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope = "row">
                              <Input type="text" id="assetName" name="DisplayName" 
                               value={this.state.DisplayName} 
                               onChange={e=>this.handleInfoChange(e)}/>
                            </th>
                            <td>
                              <Input type="text" id="location" name="Location" 
                               value={this.state.Location} 
                               onChange={e=>this.handleInfoChange(e)}/>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>   
                                        
                    <Button color="link" className="pull-right mt-3" id="next" onClick={this.onClickNext}>Next></Button>
                  </FormGroup>
                  
                  <FormGroup style={{display: this.state.manualPage == 2 ? "block" : "none"}} >
                    <div className = "table-responsive">
                      <table className = "table mt-3" style={{textAlign: "center"}}>
                        <thead>
                          <tr>
                            <th>Serial Number*</th>
                            <th>Description*</th>
                            <td>Type</td>
                            <td>Location</td>
                            <td>Angle</td>
                          </tr>
                        </thead>
                        <tbody>
                          {devices.map((x,i) =>
                            <tr key={x.key}>
                              <th scope = "row" className="p-1">
                                <Input type="text" id={x.key} name="SerialNumber" 
                                       value={devices[x.key].SerialNumber} onChange={e=>this.handleDevicesChange(e)}/>
                              </th>
                              <td className="p-1">
                                <Input type="text" id={x.key} name="DisplayName" 
                                       value={devices[x.key].DisplayName} onChange={e=>this.handleDevicesChange(e)}/>
                              </td>
                              <td className="p-1">
                                <Input type="select" id={x.key} name="Parameters" 
                                       value={devices[x.key].Parameters} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="Temperature">Temperature</option>
                                  <option value="FlowRate">FlowRate</option>
                                </Input>  
                              </td>
                              <td className="p-1">
                                <Input type="select" id={x.key} name="Tag" 
                                       value={devices[x.key].Tag} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="TubeInlet">TubeInlet</option>
                                  <option value="TubeOutlet">TubeOutlet</option>
                                  <option value="ShellInlet">ShellInlet</option>
                                  <option value="ShellOutlet">ShellOutlet</option>
                                </Input>
                              </td>
                              <td className="p-1">
                                <Input type="select" id={x.key} name="Angle" 
                                       value={devices[x.key].Angle} onChange={e=>this.handleDevicesChange(e)}>
                                  <option value=""></option>
                                  <option value="0">0°</option>
                                  <option value="90">90°</option>
                                  <option value="180">180°</option>
                                  <option value="270">270°</option>
                                </Input>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>                             
                    <Button color="secondary" id="add" onClick={this.addDevice}><i className="fas fa-plus"></i> Add Another Device</Button>
                    <br/><br/>
                    <Button color="link" className="pull-right mt-3" id="next" onClick={this.onClickNext}>Next></Button>          
                    <Button color="link" className="pull-right mt-3 mr-3" id="prev" onClick={this.onClickPrev}>{"<"}Previous</Button>
                  </FormGroup>

                  <FormGroup style={{display: this.state.manualPage == 3 ? "block" : "none"}}>
                    <hr/>
                    <Row>
                      <Col md="9">
                      <div className = "table-responsive" style={{maxHeight: "450px"}}>
                        <table className = "table mt-3" style={{textAlign: "center"}}>
                          <thead>
                            <tr>
                              <th>Description*</th>
                              <th>Tag*</th>
                              <th>Equation*</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equations.map((x,i) =>
                              <tr key={x.key}>
                                <th scope = "row" width="150px">
                                  <Input type="text" id={x.key} name="DisplayName" value={equations[x.key].DisplayName} onChange={e=>this.handleEquationsChange(e)}/>
                                </th>
                                <th scope = "row" width="150px">
                                  <Input type="text" id={x.key} name="Tag" value={equations[x.key].Tag} onChange={e=>this.handleEquationsChange(e)}/>
                                </th>
                                <td>
                                  <div style={{border: this.state.Equations[x.key].Valid ? '1px solid #d9d9d9' : '1px solid red', borderRadius: '4px', padding: '5', position: "relative", textAlign: "left"}} >
                                    <CodeMirror   
                                      id={x.key} 
                                      name="Equation"
                                      height="26" 
                                      value={equations[x.key].Equation} 
                                      editorDidMount={(editor) => {
                                        this.instance = editor;                       
                                      }}
                                      defineMode={{name: 'parameters', fn: sampleMode}}
                                      options={this.state.options}
                                      onBeforeChange={(editor, data, value) => {
                                        let equations = [...this.state.Equations];
                                        equations[x.key].Equation = value;
                                        this.setState({ equations }, () => console.log(this.state.equations));                                                     
                                      }}
                                      onChange={(editor, data, value) => {                      
                                        this.validate(value);
                                        this.handleCMChange(x.key, "Equation", value);
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
                                        this.setState({
                                          equationFocus: x.key,
                                          cursor: this.instance.getCursor(),
                                          token: this.instance.getTokenAt({line: 0, ch: this.instance.getCursor().ch})
                                        });
                                      }} 
                                      onMouseDown={(editor, data) => { 
                                        this.setState({equationFocus: x.key});
                                      }}     
                                    />
                                    {this.state.Equations[x.key].Valid ? 
                                    <Icon title="valid equation" color="green" style={{color: "green", position: "absolute", right: 10, bottom: 10, fontWeight: "bold"}} type="check-circle" />
                                    :
                                    <Icon title="invalid equation" color="red" style={{color: "red", position: "absolute", right: 10, bottom: 10, fontWeight: "bold"}} type="exclamation-circle" />
                                    }
                                  </div>                                
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>   
                      <Button color="secondary" id="add" onClick={this.addEquation}><i className="fas fa-plus"></i> Add Another Equation</Button>
                      </Col>
                      <Col md="3">
                        <div className="p-3" style={{border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "eee"}}>
                          <div>
                            <h6>Group Data</h6>
                            {groupData.map((x,i) => <Tag key={i} className="mb-2" onClick={()=>this.addText('['+x+']')} value={x}>{x}</Tag>)}
                          </div>
                          <hr/>
                          <div>
                            <h6>Parameters</h6>
                            {equations.map((x,i) => <Tag key={i} style={{display: x.Tag ? "inline-block" : "none"}} className="mb-2" onClick={()=>this.addText('['+x.Tag+']')} value={x.Tag}>{x.Tag}</Tag>)}
                          </div>
                          <hr/>
                          <div>
                            <h6>Operators</h6>
                            {operators.map((x,i) => <Tag key={i} style={{display: x.Name ? "inline-block" : "none"}} className="mb-2" onClick={()=>this.addText(x.Name)} value={x.Name}>{x.Name}</Tag>)}
                          </div>
                        </div>                        
                      </Col>
                    </Row>                    
                    <br/><br/>
                    <Button color="success" className="pull-right mt-3" id="add" onClick={this.addButtonClicked}>Add Asset</Button>           
                    <Button color="link" className="pull-right mt-3 mr-3" id="prev" onClick={this.onClickPrev}>{"<"}Previous</Button>
                  </FormGroup>
                </Form>
              </div>
            </ModalBody>
          </Modal>
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

export default AddAsset;
