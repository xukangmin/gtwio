import React from 'react';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';

import { assetActions } from '../_actions/assetAction';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import { parameterActions } from '../_actions/parameterAction';

import { Button, Form, Input } from 'reactstrap';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';

import moment from 'moment';

class BaselinePicker extends React.Component {
    constructor(props) {
      super(props);

      this.user = JSON.parse(localStorage.getItem('user'));

      this.state = {
        baselines: [{
          key: 0,
          timestamp: ''
        }]
      };

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

    render() {
      let baselines = this.state.baselines;

      return (
        <div style={{display: "inline-block"}}>

          <Button className="btn-light">
            <i className ="fas fa-clock mr-2"></i>
            Baseline:
            <i className="fas fa-angle-down ml-3"></i>
          </Button>

          <div className = "table-responsive" style={{position: "absolute"}}>
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
          </div>           
         

            
          
        </div>
      );
    }
}

export default BaselinePicker;
