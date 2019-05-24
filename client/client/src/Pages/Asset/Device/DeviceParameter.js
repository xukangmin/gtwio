import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { dataActions } from '../../../_actions/dataAction';
import { Table } from 'reactstrap';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';

import Loader from '../../../Widgets/Loader';
import toastr from 'toastr';
import InlineEdit from 'react-inline-edit-input';
import EmptyData from '../../../Widgets/EmptyData';

const ParameterTable = (props) => {
  const parameter = props.data;
  const device = props.device;
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
            <th>Timestamp</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i} >
                <td style = {{padding:0}}>{moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
                <td style = {{textAlign:"center", fontWeight: "bold", padding: 0}}>{item.Value.toFixed(2) + device.Parameters[0].Unit}</td>
              </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

class DeviceParameter extends React.Component {
  constructor(props) {
    super(props);

    console.log(props)
    this.state = {
        DeviceID: props.data.Parameters[0].ParameterID,
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
    this.range = JSON.parse(localStorage.getItem('range'));

    let liveDispatchInterval = 60*1000;
    if (this.range.live){
          this.props.dispatch(dataActions.getSingleParameterData(this.state.DeviceID, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          setInterval(() => {
            this.props.dispatch(dataActions.getSingleParameterData(this.state.DeviceID, new Date().getTime()-this.range.interval*60*1000, new Date().getTime()));
          }, liveDispatchInterval);
        } else {
            this.props.dispatch(dataActions.getSingleParameterData(this.state.DeviceID, this.range.start*1000, this.range.end*1000));
        }
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

  render() {
    const { parameterData } = this.props;
    
      return (
        <div className = "mt-3">
        {this.state.DeviceID ?
          <div>            
            {parameterData && parameterData.length?
              <div className = "row mt-3">
                <div className = "col-auto">
                  <h6>History</h6>
                  <ParameterTable data={this.sortTime(parameterData)} device={this.props.data}/>
                </div>
                <div className = "col-sm-auto col-lg-8">
                  <SingleLinePlot parameterData={this.sortTime(parameterData)}/>
                </div>
              </div>
              :
              <EmptyData/>
            }
          </div> :
          <Loader/>
        }
        </div>
      );
    }
  }


function mapStateToProps(state) {
  return {
      parameterData: state.data.data
  };
}

const connectedPage = connect(mapStateToProps)(DeviceParameter);
export { connectedPage as DeviceParameter };
