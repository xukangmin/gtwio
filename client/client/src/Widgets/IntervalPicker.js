import React from 'react';
import { connect } from 'react-redux';
import { assetActions } from '../_actions/assetAction';
import { DatePicker, Slider, InputNumber } from 'antd';
import 'antd/dist/antd.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Row, Col, Label, Input } from 'reactstrap';

class IntervalPicker extends React.Component {
    constructor(props) {
      super(props);

      const {data} = props;
      
      this.asset = props.asset.AssetID;
      this.user = JSON.parse(localStorage.getItem('user'));
      this.Intervals = data ? data : [];      

      this.state = {
        asset: this.asset,
        Intervals: this.Intervals,
        IntervalModalOpen: false
      }
      
      this.IntervalModalToggle = this.IntervalModalToggle.bind(this);
      this.deleteInterval = this.deleteInterval.bind(this);
      this.addInterval = this.addInterval.bind(this);
      this.updateIntervalState = this.updateIntervalState.bind(this);
      this.updateInterval = this.updateInterval.bind(this);
      this.handleIntervalApply = this.handleIntervalApply.bind(this);
    }

    IntervalModalToggle(t){
      this.setState(prevState => ({
        IntervalModalOpen: !prevState.IntervalModalOpen
      }));
    }

    deleteInterval(i){  
      let newIntervals = this.state.Intervals;
      delete newIntervals[i];
      this.setState({
        Intervals: newIntervals
      });
      this.props.dispatch(assetActions.deleteTimeInterval(this.asset, this.state.Intervals[i]*60*1000))
    }

    addInterval(){     
      
      var newInterval = prompt("Please enter an interval (min)");
      // if(typeof(newInterval)=='number'){
        let Intervals = this.state.Intervals;
        Intervals.push(newInterval);
        this.setState({
          Intervals: Intervals
        });
        this.props.dispatch(assetActions.addTimeInterval(this.asset, parseInt(newInterval)*60*1000));
      // };
      
    }

    updateIntervalState(t,i){
      this.props.dispatch(assetActions.deleteTimeInterval(this.asset, this.state.Intervals[i]*60*1000))
      let tempIntervals = this.state.Intervals;
      tempIntervals[i] = t;
      this.setState({
        Intervals: tempIntervals
      });
    }

    updateInterval(t,i){
      this.props.dispatch(assetActions.addTimeInterval(this.asset, t*60*1000))
    }

    handleIntervalApply(e){
      this.IntervalModalToggle();
      
      if(e.target.name == "apply"){
          console.log('apply')
          console.log(this.Intervals)
          this.Intervals.forEach((e)=>this.props.dispatch(assetActions.deleteTimeInterval(this.asset, e*60*1000)));
        
          // const add = function (){
          //   for (var i in this.state.Intervals){
          //   console.log('a'+i)
          //   this.props.dispatch(assetActions.addTimeInterval(this.asset, i*60*1000));      
          // }
        
        
      } else if (e.target.name == "cancel"){
        this.setState({
          Intervals: this.Intervals
        });
      }
    }

    componentDidMount(){
      for (var i in this.state.Intervals){
        let tempIntervals = this.state.Intervals;
        tempIntervals[i] = parseInt(this.Intervals[i])/60/1000;
        this.setState({Intervals: tempIntervals});
      }
    }

    render() {  
      function formatter(value) {
        return `${value} min`;
      }        

      return (
        <div style={{display: "inline-block"}}>
          <Button onClick={this.IntervalModalToggle} className="btn-light" style={{border: "1px solid #d3d3d3"}}>
            <i className ="fas fa-clock mr-2"></i>
            Intervals
            <i className="fas fa-angle-down ml-3"></i>
          </Button>   

          <Modal isOpen={this.state.IntervalModalOpen} toggle={this.IntervalModalToggle} backdrop={false} style={{minWidth: "700"}}>
            <ModalHeader toggle={this.IntervalModalToggle}>Interval Setting</ModalHeader>
            <ModalBody>
            <Form>
              <FormGroup>
                <div className = "table-responsive">
                  <table className = "table mt-3" style={{textAlign: "center"}}>
                    <thead>
                      <tr>
                        <th>Interval</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                      <tbody>                      
                      {this.state.Intervals.map((x,i) =>
                      <tr key={i}>
                        <th scope = "row" className="p-1">
                          <Row>
                            <Col sm="8" style={{display: "none"}}>
                              <Slider 
                                defaultValue={this.state.Intervals[i]} 
                                min={1}
                                max={60}
                                onChange={(t)=>this.updateIntervalState(t, i)}
                                onAfterChange={(t)=>this.updateInterval(t, i)}
                              />
                            </Col>
                            <Col sm="4" className="pt-2" style={{textAlign: "center"}}>
                              <span>{this.state.Intervals[i] + (this.state.Intervals[i] == 1 ? " min" : " mins")}</span>
                            </Col>
                          </Row>  
                        </th>
                        <th className="p-1">
                          <Button color="danger" title="delete this Interval" onClick={()=>this.deleteInterval(i)}><i className ="fas fa-trash"></i></Button>
                        </th>                              
                    </tr>)}
                    </tbody>
                  </table>
                  <Button color="secondary" id="add" onClick={this.addInterval}><i className="fas fa-plus"></i> Add New Interval</Button>
                </div>        
              </FormGroup>
                  
            </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" name="apply" onClick={e=>this.handleIntervalApply(e)}>Confirm</Button>
              <Button color="secondary" name="cancel" onClick={e=>this.handleIntervalApply(e)}>Cancel</Button>
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

const connectedPage = connect(mapStateToProps)(IntervalPicker);
export { connectedPage as IntervalPicker };