import React from 'react';
import { connect } from 'react-redux';

class EquationEditor extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
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
  return {};
}

const connectedPage = connect(mapStateToProps)(EquationEditor);
export { connectedPage as EquationEditor };
