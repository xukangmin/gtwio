import React from 'react';
import { assetActions } from '../_actions/assetAction';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class BaselinePicker extends React.Component {
    constructor(props) {
      super(props);

      this.user = JSON.parse(localStorage.getItem('user'));

      this.state = {
        baselines: [{
          key: 0,
          timestamp: ''
        }],
        addModalOpen: false
      };

      this.addModalToggle = this.addModalToggle.bind(this);

      this.updateBaseline = this.updateBaseline.bind(this);
      this.addBaseline = this.addBaseline.bind(this);
    }

    updateBaseline(date, dateString){
      console.log(date, dateString)
    }

    addBaseline(){
      this.setState((prevState) => ({
        baselines: [...prevState.baselines, {
          key: this.state.baselines.length, 
          timestamp: ""
        }],
      }));
    }

    addModalToggle(){
      this.setState(prevState => ({
        addModalOpen: !prevState.addModalOpen
      }));
    }

    render() {
      let baselines = this.state.baselines;

      return (
        <div style={{display: "inline-block"}}>


          <Button onClick={this.addModalToggle} className="btn-light" style={{border: "1px solid #d3d3d3"}}>
            <i className ="fas fa-clock mr-2"></i>
            Baseline:
            <i className="fas fa-angle-down ml-3"></i>
          </Button>


          <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Baseline Setting</ModalHeader>
              <ModalBody>
              <Form>
                <FormGroup>
                  <div className = "table-responsive">
                    <table className = "table mt-3" style={{textAlign: "center"}}>
                      <thead>
                        <tr>
                          <th>Active</th>
                          <th>TimeStamp</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                        <tbody>
                        {baselines.map((x,i) =>
                          <tr key={x.key}>
                            <th><input type="radio" name="baseline" value="1"/></th>
                            <th scope = "row" className="p-1">
                              <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                placeholder={['Time']}
                                onChange={this.updateBaseline}
                              />
                            </th>
                            <th className="p-1">
                              <Button color="danger"><i className ="fas fa-trash"></i></Button>
                            </th>                              
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <Button color="secondary" id="add" onClick={this.addBaseline}><i className="fas fa-plus"></i> Add Another Baseline</Button>
                  </div>        
                </FormGroup>
                   
              </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" id="add" onClick={this.addModalToggle}>Add</Button>
                <Button color="secondary" id="cancel" onClick={this.addModalToggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
        </div>
      );
    }
}

export default BaselinePicker;
