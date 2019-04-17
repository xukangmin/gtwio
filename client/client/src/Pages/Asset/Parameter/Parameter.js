import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { parameterActions } from '../../../_actions/parameterAction';
import Loader from '../../../Widgets/Loader';

import { Table } from 'reactstrap';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';
import InlineEdit from 'react-inline-edit-input';

const ParameterInfo = (props) => {
  const parameter = props.data;

  return(
    <div className = "row">
      <div className="col-12">
        <h4>{parameter.DisplayName}</h4>
      </div>
      <div className = "col-lg-6 col-sm-12">
        <Table striped>
          <tbody>
            <tr>
              <th>Parameter ID</th>
              <td>{parameter.ParameterID}</td>
            </tr>
            <tr>
              <th>Tag</th>
              <td>{parameter.Tag}</td>
            </tr>
            <tr>
              <th>Equation</th>
              <td>
                <InlineEdit
                  value={parameter.Equation}
                  tag="span"
                  type="text"
                  saveLabel="Update"
                  saveColor="#17a2b8"
                  cancelLabel="Cancel"
                  cancelColor="#6c757d"
                  onSave={value => props.update(parameter.ParameterID, value)}
                />
              </td>
            </tr>
            {parameter.CurrentValue &&
              <tr>
                <th>Current Value</th>
                <td>{parameter.CurrentValue.toFixed(2)}{parameter.Unit && parameter.Unit}</td>
              </tr>
            }
            {parameter.CurrentTimeStamp &&
              <tr>
                <th>Current Time Stamp</th>
                <td>{moment(new Date(parameter.CurrentTimeStamp)).format('MMMM Do YYYY, H:mm')}</td>
              </tr>
            }
          </tbody>
        </Table>
        </div>
        <div className = "col-lg-6 col-sm-12">
        <Table striped>
          {parameter.Range &&
            <tbody>            
            {typeof(parameter.Range.LowerLimit)=="number" &&
              <tr>
                <th>LowerLimit</th>
                <td>
                  <InlineEdit
                    value={parameter.Range.LowerLimit}
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
            }
            {typeof(parameter.Range.UpperLimit)=="number" &&
              <tr>
                <th>UpperLimit</th>
                <td>
                <InlineEdit
                  value={parameter.Range.UpperLimit}
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
            }
          </tbody>}
        </Table>
      </div>
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
        ParameterID: props.match.params.parameterID
    }

    this.updateEquation = this.updateEquation.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
  }

  updateEquation(parameterID, value){
    var paraData = {};
    paraData.ParameterID = parameterID;
    paraData.Equation = value;
    this.props.dispatch(parameterActions.updateParameter(this.state.AssetID, paraData));
  }

  updateLimit(parameter, item, value){
    console.log(parameter)
    let paraData = {};
    paraData.ParameterID = parameter.ParameterID;

    paraData.Range = parameter.Range;
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

  render() {
    const { parameter } = this.props;
    let { parameterData } = this.props;

    if (!this.user)
    {
      return (<Redirect to = '/login' />);
    }
    else{
      return (
        <div className = "mt-3">
        {parameter && parameterData ?
          <div>
            <ParameterInfo data={parameter} update={this.updateEquation} updateLimit={this.updateLimit}/>
            {parameterData &&
            <div className = "row mt-3">
              <div className = "col-auto">
                <h6>History</h6>
                <ParameterTable data={this.sortTime(parameterData)}/>
              </div>
              <div className = "col-sm-auto col-lg-8">
                <SingleLinePlot parameterData={this.sortTime(parameterData)} unit={parameter.Unit}/>
              </div>
            </div>
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
  const parameter = state.parameter.data
  return {
      parameterData: data,
      parameter: parameter
  };
}

const connectedPage = connect(mapStateToProps)(Parameter);
export { connectedPage as Parameter };
