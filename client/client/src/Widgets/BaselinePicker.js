import React from 'react';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';
import { Redirect } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import { assetActions } from '../_actions/assetAction';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

class BaselinePicker extends React.Component {
    constructor(props) {
      super(props);

      const {data} = props;
      
      this.asset = data.AssetID;
      this.baselines = data.Settings.Baselines ? data.Settings.Baselines :[];
      this.user = JSON.parse(localStorage.getItem('user'));

      this.state = {
        asset: this.asset,
        baselines: this.baselines,
        activeBaseline: (this.baselines.findIndex(x=>x.Active==1) >=0) ? this.baselines.findIndex(x=>x.Active==1) : -1,
        baselineModalOpen: false
      }

      this.props.dispatch(assetActions.getTimeRangeByAsset(this.asset));
      
      this.baselineModalToggle = this.baselineModalToggle.bind(this);
      this.updateBaselineActive = this.updateBaselineActive.bind(this);
      this.updateBaselineTime = this.updateBaselineTime.bind(this);
      this.deleteBaseline = this.deleteBaseline.bind(this);
      this.addBaseline = this.addBaseline.bind(this);
      this.handleBaselineApply = this.handleBaselineApply.bind(this);
    }

    baselineModalToggle(t){
      this.setState(prevState => ({
        baselineModalOpen: !prevState.baselineModalOpen
      }));
    }

    updateBaselineActive(e){
      this.setState({
        activeBaseline: e.target.name
      });
    }

    updateBaselineTime(t,i){
      let tempBaselines = this.state.baselines;
      tempBaselines[i].TimeStamp = parseInt(t.format('x'));
      this.setState({
        baselines: tempBaselines
      });
    }

    deleteBaseline(t){
      // console.log(this.state.baselines[this.state.activeBaseline].TimeStamp)
      if (t == this.state.baselines[this.state.activeBaseline].TimeStamp){
        this.setState({
          activeBaseline: -1
        });
      }
      let newBaselines = this.state.baselines.filter(x=>x.TimeStamp != t) || [];
      this.setState({
        baselines: newBaselines
      });
    }

    addBaseline(){
      this.setState((prevState) => ({
        baselines: [...prevState.baselines, {
          TimeStamp: "",
          Active: ""
        }],
      }));
    }

    handleBaselineApply(e){
      this.baselineModalToggle();
      
      if(e.target.name == "apply"){
        let tempBaselines = [];
        for (var i in this.state.baselines){
          if(this.state.baselines[i].TimeStamp){
            tempBaselines.push({
              TimeStamp: this.state.baselines[i].TimeStamp,
              Active: this.state.activeBaseline == i ? 1 : 0
            });
          }          
        }
        this.props.dispatch(assetActions.updateBaseline(this.user, this.asset, tempBaselines));
      } else if (e.target.name == "cancel"){
        this.setState({
          baselines: this.baselines,
          activeBaseline: this.baselines.findIndex(x=>x.Active==1)
        });
      }
    }

    render() {
      const timeRange = this.props.timeRange;
      let MinTimeRange, MaxTimeRange;
      
      if(timeRange){
        MaxTimeRange = Math.max(...timeRange);
        MinTimeRange = Math.min(...timeRange);
      }

      function range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
          result.push(i);
        }
        return result;
      }

      function disabledDate(current) {
        return current > moment(MaxTimeRange).add(1,'days') || current < moment(MinTimeRange).subtract(1,'days');
      }
      
      function disabledDateTime() {
        return {
          disabledHours: () => range(0, 24).splice(4, 20),
          disabledMinutes: () => range(30, 60),
          disabledSeconds: () => [55, 56],
        };
      }

      return (
        <div style={{display: "inline-block"}}>
          <Button onClick={this.baselineModalToggle} className="btn-light" style={{border: "1px solid #d3d3d3"}}>
            <i className ="fas fa-clock mr-2"></i>
            Baseline: {this.state.activeBaseline>=0 ? moment(this.state.baselines[this.state.activeBaseline].TimeStamp).format('YYYY-MM-DD H:mm') : 'N/A'}
            <i className="fas fa-angle-down ml-3"></i>
          </Button>   

          {timeRange &&
            <Modal isOpen={this.state.baselineModalOpen} toggle={this.baselineModalToggle} backdrop={false}>
            <ModalHeader toggle={this.baselineModalToggle}>Baseline Setting</ModalHeader>
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
                      {this.state.baselines.map((x,i) =>
                      <tr key={i}>
                        <th>
                          <input type="radio" name={i} value={this.state.activeBaseline == i} onChange={(e)=>this.updateBaselineActive(e)} checked={this.state.activeBaseline == i}/></th>
                        <th scope = "row" className="p-1">
                          {x.TimeStamp ? 
                            moment(x.TimeStamp).format('YYYY-MM-DD H:mm') : 
                            <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                            placeholder={'Time'}
                            disabledDate={disabledDate}
                            onOk={(t)=>this.updateBaselineTime(t, i)}
                          />
                          }
                        </th>
                        <th className="p-1">
                          <Button color="danger" onClick={()=>this.deleteBaseline(x.TimeStamp)}><i className ="fas fa-trash"></i></Button>
                        </th>                              
                    </tr>)}
                    </tbody>
                  </table>
                  <Button color="secondary" id="add" onClick={this.addBaseline}><i className="fas fa-plus"></i> Add Another Baseline</Button>
                </div>        
              </FormGroup>
                  
            </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" name="apply" onClick={e=>this.handleBaselineApply(e)}>Confirm</Button>
              <Button color="secondary" name="cancel" onClick={e=>this.handleBaselineApply(e)}>Cancel</Button>
            </ModalFooter>
          </Modal>        
          }
          
        </div>
      );
    }
}

function mapStateToProps(state) {
  const { data } = state.asset;
  return {
    assetData: data,
    timeRange: state.asset.timeRange
  };
}

const connectedPage = connect(mapStateToProps)(BaselinePicker);
export { connectedPage as BaselinePicker };