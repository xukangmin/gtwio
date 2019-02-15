import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { dataActions } from '../_actions/dataAction'
import { parameterActions } from '../_actions/parameterAction'
import './asset.css'
import Loader from '../_components/loader'
import SideNav from '../_components/sideNav'
import HeaderNav from '../_components/headerNav'
import { Table } from 'reactstrap';
import { ParameterPlot } from '../AssetPage/dashboard_parts/widget_parts/ParameterPlot';
import InlineEdit from 'react-inline-edit-input';
import toastr from 'toastr';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


const AddNewParameterModal = ({device,onChange,errors,onAdd,isOpen,onClose}) => {
    return (
        <div>
            <Modal isOpen={isOpen} toggle={onClose} className="modal-dialog-centered">
                <ModalHeader toggle={onClose}>Add New Device</ModalHeader>
                <ModalBody>
                    <AddNewDeviceForm
                        device={device}
                        onChange={onChange}
                        errors={errors}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={onAdd}>Add</Button>{' '}
                    <Button color="secondary" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
      </div>

    );
}


const ParameterInfo = (props) => {
  const parameter = props.data;
  return(
    <div className = "row">
      <div className="col-12">
        <h3>{parameter.DisplayName}</h3>
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
                <td>{parameter.CurrentValue.toFixed(3)}</td>
              </tr>
            }
            {parameter.CurrentTimeStamp &&
              <tr>
                <th>Current Time Stamp</th>
                <td>{new Date(Number(parameter.CurrentTimeStamp)).toLocaleString()}</td>
              </tr>
            }

          </tbody>
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
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {parameter.map((item,i) =>
              <tr key = {i}>
                <td>{new Date(item.TimeStamp).toLocaleTimeString("en-US")}</td>
                <td style = {{textAlign:"center", fontWeight: "bold"}}>{item.Value.toFixed(2)}</td>
              </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

class AssetParameterDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        AssetID : props.match.params.assetID,
        ParameterID: props.match.params.parameterID
    }

    this.props.dispatch(parameterActions.getSingleParameter(this.state.ParameterID));
    //this.props.dispatch(dataActions.getSingleParameterData(this.state.ParameterID, 1549470293237, 1549470453241));
    this.updateEquation = this.updateEquation.bind(this);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));
  }

  componentDidMount() {
    this.dispatchParameterContinuously = setInterval(() => {
      this.props.dispatch(parameterActions.getSingleParameter(this.state.ParameterID));
    }, 5000);
  }


  updateEquation(parameterid, value){
    console.log("updateEquation called");
    console.log(value);
    var paradata = {};
    paradata.ParameterID = parameterid;
    paradata.Equation = value;
    this.props.dispatch(parameterActions.updateParameter(paradata));
    toastr.success("Equation updated.");
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
    const { AssetID } = this.state;
    const { parameter } = this.props;
    let { parameterData } = this.props;

    //console.log(parameter)
/*    if(!this.props.parameter){
      this.dispatchParameterContinuously = setInterval(() => {
        this.props.dispatch(dataActions.getSingleParameterData(parameter.ParameterID, 1549470293237, 1549470453241));
      }, 5000);
    }
*/
    if (!this.user)
    {
      return (<Redirect to = '/login' />);
    }
    else{
      return (
        <div className = "mt-3">
        {parameter ?
          <div>
            <ParameterInfo data={parameter} update={this.updateEquation}/>
            {parameterData &&
            <div className = "row mt-3">
              <div className = "col-auto">
                <h3>History</h3>
                <ParameterTable data={this.sortTime(parameterData)}/>
              </div>
              <div className = "col-sm-auto col-lg-8">
                <ParameterPlot/>
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

const connectedPage = connect(mapStateToProps)(AssetParameterDetail);
export { connectedPage as AssetParameterDetail };
