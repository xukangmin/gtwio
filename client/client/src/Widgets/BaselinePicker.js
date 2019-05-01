import React from 'react';
import { connect } from 'react-redux';
import { assetActions } from '../_actions/assetAction';
import { DatePicker, Slider, InputNumber } from 'antd';
import 'antd/dist/antd.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Row, Col, Label, Input } from 'reactstrap';

class BaselinePicker extends React.Component {
    constructor(props) {
      super(props);

      const {data} = props;
      
      this.asset = data.AssetID;
      this.user = JSON.parse(localStorage.getItem('user'));
      this.baselines = data.Settings.Baselines ? data.Settings.Baselines : [];      

      this.state = {
        asset: this.asset,
        baselines: this.baselines,
        activeBaseline: (this.baselines.findIndex(x=>x.Active==1) >=0) ? this.baselines.findIndex(x=>x.Active==1) : -1,
        baselineModalOpen: false
      }
      
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
      tempBaselines[i].TimeInterval = t;
      this.setState({
        baselines: tempBaselines
      });
    }

    deleteBaseline(i){  
      let newBaselines = this.state.baselines;
      delete newBaselines[i];
      this.setState({
        baselines: newBaselines
      });
    }

    addBaseline(){     
      let baselines = this.state.baselines;
      baselines.push({
        TimeInterval: 30,
        Active: 1
      });

      this.setState({
        baselines: baselines,
        activeBaseline: baselines.length - 1
      });
    }

    handleBaselineApply(e){
      this.baselineModalToggle();
      
      if(e.target.name == "apply"){
        let tempBaselines = [];
        for (var i in this.state.baselines){
          if(this.state.baselines[i].TimeInterval){
            tempBaselines.push({
              TimeInterval: parseInt(this.state.baselines[i].TimeInterval)*60*1000,
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

    componentDidMount(){
      for (var i=0; i<this.baselines.length; i++){
        let tempBaselines = this.baselines;
        tempBaselines[i].TimeInterval = parseInt(this.baselines[i].TimeInterval)/60/1000;
        this.setState({baselines: tempBaselines});
      }
    }

    render() {    

      function formatter(value) {
        return `${value} min`;
      }
      
      

      return (
        <div style={{display: "inline-block"}}>
          <Button onClick={this.baselineModalToggle} className="btn-light" style={{border: "1px solid #d3d3d3"}}>
            <i className ="fas fa-clock mr-2"></i>
            Baseline: {this.state.activeBaseline!= -1 ? this.state.baselines[this.state.activeBaseline].TimeInterval + (this.state.baselines[this.state.activeBaseline].TimeInterval == 1 ? " Minute" : " Minutes") : 'N/A'}
            <i className="fas fa-angle-down ml-3"></i>
          </Button>   

          
            <Modal isOpen={this.state.baselineModalOpen} toggle={this.baselineModalToggle} backdrop={false} style={{minWidth: "700"}}>
            <ModalHeader toggle={this.baselineModalToggle}>Baseline Setting</ModalHeader>
            <ModalBody>
            <Form>
              <FormGroup>
                <div className = "table-responsive">
                  <table className = "table mt-3" style={{textAlign: "center"}}>
                    <thead>
                      <tr>
                        <th>Active</th>
                        <th>Interval</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                      <tbody>                      
                      {this.state.baselines.map((x,i) =>
                      <tr key={i}>
                        <th>
                          <input type="radio" name={i} value={this.state.activeBaseline == i} onChange={(e)=>this.updateBaselineActive(e)} checked={this.state.activeBaseline == i}/></th>
                        <th scope = "row" className="p-1">
                          <Row>
                            <Col sm="8">
                              <Slider 
                                defaultValue={this.state.baselines[i].TimeInterval} 
                                min={1}
                                max={60}
                                onChange={(t)=>this.updateBaselineTime(t, i)}
                              />
                            </Col>
                            <Col sm="4" className="pt-2">
                              <span>{this.state.baselines[i].TimeInterval + (this.state.baselines[i].TimeInterval == 1 ? " min" : " mins")}</span>
                            </Col>
                          </Row>
                          
                          
                        </th>
                        <th className="p-1">
                          <Button color="danger" title={i==this.state.activeBaseline ? "an active baseline can't be deleted" : "delete this baseline"} disabled={i==this.state.activeBaseline} onClick={()=>this.deleteBaseline(i)}><i className ="fas fa-trash"></i></Button>
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
        </div>
      );
    }
}

function mapStateToProps(state) {
  const { data } = state.asset;
  return {
    assetData: data
  };
}

const connectedPage = connect(mapStateToProps)(BaselinePicker);
export { connectedPage as BaselinePicker };