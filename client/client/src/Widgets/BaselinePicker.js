import React from 'react';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';

import { assetActions } from '../_actions/assetAction';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';


import { DatePicker } from 'antd';
import 'antd/dist/antd.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import moment from 'moment';

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


          <Button onClick={this.addModalToggle} className="btn-light">
            <i className ="fas fa-clock mr-2"></i>
            Baseline:
            <i className="fas fa-angle-down ml-3"></i>
          </Button>


          <Modal isOpen={this.state.addModalOpen} toggle={this.addModalToggle}>
              <ModalHeader toggle={this.addModalToggle}>Baseline Setting</ModalHeader>
              <ModalBody>
                <Form>
                <FormGroup><div className = "table-responsive" style={{position: "absolute"}}>
            <table className = "table mt-3" style={{textAlign: "center"}}>
              <tbody>
                {baselines.map((x,i) =>
                  <tr key={x.key}>
                    <th scope = "row" className="p-1">
                      <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder={['Time']}
                        onChange={this.updateBaseline}
                      />
                    </th>
                    <td className="p-1">
                      <i className ="fas fa-trash"></i>
                    </td>                              
                  </tr>
                )}
              </tbody>
            </table>
            <Button color="secondary" id="add" onClick={this.addBaseline}><i className="fas fa-plus"></i> Add Another Baseline</Button>
          </div>        </FormGroup>
                   
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" id="add" >Add</Button>{' '}
                <Button color="secondary" id="cancel">Cancel</Button>
              </ModalFooter>
            </Modal>
          
         

            
          
        </div>
      );
    }
}

export default BaselinePicker;
