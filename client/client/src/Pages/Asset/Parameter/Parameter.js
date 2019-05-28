import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { parameterActions } from '../../../_actions/parameterAction';
import { deviceActions } from '../../../_actions/deviceAction';
import { dataActions } from '../../../_actions/dataAction';
import Loader from '../../../Widgets/Loader';
import { EditEquation } from '../../../Modals/EditEquation';

import { Table } from 'reactstrap';
import EmptyData from '../../../Widgets/EmptyData';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';
import InlineEdit from 'react-inline-edit-input';

import { Tabs } from 'antd';
import 'antd/dist/antd.css';
const TabPane = Tabs.TabPane;

const ParameterInfo = (props) => {
  const parameter = props.data;
  const { asset, user } = props;
  return(
    <div className = "row">      
      <div className = "col-lg-6 col-sm-12">
        <Table striped>
          <tbody>
            <tr>
              <th>Tag</th>
              <td>{parameter.Tag}</td>
            </tr>
            <tr>
              <th>Equation</th>
              <td>
                {parameter.OriginalEquation} 
              </td>
            </tr>
            <tr>
              <th>Current Value</th>
              <td>{parameter.CurrentValue ? parameter.CurrentValue.toFixed(2) : "N/A"}{parameter.Unit && parameter.Unit}</td>
            </tr>
            <tr>
              <th>Current Time Stamp</th>
              <td>{parameter.CurrentTimeStamp && moment(new Date(parameter.CurrentTimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
            </tr>
          </tbody>
        </Table>
        </div>
        {parameter.Range &&
          <div className = "col-lg-6 col-sm-12">
          <Table striped>
              <tbody>   
                <tr>
                  <th>LowerLimit</th>
                  <td>
                    <InlineEdit
                      value={parameter.Range ? parameter.Range.LowerLimit : "N/A"}
                      tag="span"
                      type="text"
                      saveLabel="Update"
                      saveColor="#17a2b8"
                      cancelLabel="Cancel"
                      cancelColor="#6c757d"
                      onSave={value => props.updateLimit(parameter, "LowerLimit", value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>UpperLimit</th>
                  <td>
                  <InlineEdit
                    value={parameter.Range ? parameter.Range.UpperLimit : "N/A"}
                    tag="span"
                    type="text"
                    saveLabel="Update"
                    saveColor="#17a2b8"
                    cancelLabel="Cancel"
                    cancelColor="#6c757d"
                    onSave={value => props.updateLimit(parameter, "UpperLimit", value)}
                  />
                  </td>
                </tr>
            </tbody>
          </Table>
        </div>
        }        
    </div>
  );
};

const ParameterTable = (props) => {
  const parameter = props.data;
  return(
    <div>
      <Table
        style={{
          display: "block",
          height: "50vh",
          overflowY: "scroll"
        }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i}>
                <td style={{padding: 0}}>{moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
                <td style = {{textAlign:"center", fontWeight: "bold", padding: 0}}>{parseFloat(item.Value).toFixed(2)}{item.Unit && item.Unit}</td>
              </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

class Parameter extends React.Component {
  constructor(props) {
    super(props);    

    this.state = {
        AssetID : props.match.params.assetID,
        ParameterID: props.match.params.parameterID,
        activePara: undefined
    }

    this.updateLimit = this.updateLimit.bind(this);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.getParameterData = this.getParameterData.bind(this);
  }

  updateLimit(parameter, item, value){
    let paraData = {
      'ParameterID': parameter.ParameterID,
      'Range': parameter.Range
    };        
    paraData.Range[item] = parseInt(value);
    this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, paraData));    
  }

  sortTime(data){
    return(data.sort(
      function(a,b){
        var TimeA = a.TimeStamp;
        var TimeB = b.TimeStamp;
        if (TimeA > TimeB) {
          return -1;
        }
        if (TimeA < TimeB) {
          return 1;
        }
        return 0;
      }
    ))
  }

  componentDidUpdate (){    
    if(this.props.parameter && this.state.activePara === undefined){
      this.getParameterData(this.props.parameter[0].ParameterID);
    }
  }

  getParameterData(activeParameter){
    this.range = JSON.parse(localStorage.getItem('range'));
    let liveDispatchInterval = 60*1000;
    this.setState({activePara: activeParameter})
    if (this.range.live){
      this.props.dispatch(dataActions.getSingleParameterData(activeParameter, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
      setInterval(() => {
        this.props.dispatch(dataActions.getSingleParameterData(activeParameter, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
      }, liveDispatchInterval);
    } else {
      this.props.dispatch(dataActions.getSingleParameterData(activeParameter, this.range.start*1000, this.range.end*1000));
    }      
  }

  render() {
    let { parameter } = this.props;
    let { parameterData } = this.props;    
    
    if (!this.user) {
      return (<Redirect to = '/login' />);
    } else{
      return (
        <div className = "mt-3">
        {parameter?
          <div>
            <h4>{parameter[0].DisplayName}</h4>
            <Tabs onChange={this.getParameterData}>      
            {parameter.map((x, i)=>
              <TabPane 
                tab={x.DisplayName + (x.Tag.split(':')[1] ? ' - ' + parseInt(x.Tag.split(':')[1])/60000+'min' : '')} 
                key={x.ParameterID}>
                <ParameterInfo 
                  data={x} 
                  user={this.user} 
                  asset={this.state.AssetID} 
                  update={this.updateEquation} 
                  updateLimit={this.updateLimit}/>
              </TabPane>
            )}
            </Tabs>            
            
            {parameterData && parameterData.length ?
            <div className = "row mt-3">
              <div className = "col-auto">
                <h6>History</h6>
                <ParameterTable data={this.sortTime(parameterData)}/>
              </div>
              <div className = "col-sm-auto col-lg-8">
                <SingleLinePlot parameterData={this.sortTime(parameterData)} unit={parameter.Unit}/>
              </div>
            </div>
           :
           <EmptyData/>
           }
          </div>
        :
          <Loader/>
        }
      </div>
      );
    }
  }
}

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

const connectedPage = connect(mapStateToProps)(Parameter);
export { connectedPage as Parameter };
