import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { assetActions } from '../_actions/assetAction';
import { deviceActions } from '../_actions/deviceAction';

import './asset.css';

import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import { DeviceCard } from './device_parts/DeviceCard';
import { NewDeviceCard } from './device_parts/NewDeviceCard';
import { AddNewDeviceModal } from './device_parts/AddNewDeviceModal';
import { DeleteDeviceModal } from './device_parts/DeleteDeviceModal';
import { Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';

import toastr from 'toastr';

class AssetDevice extends React.Component {
  constructor(props) {
    console.log('asset device')
    super(props);
    this.state = {
        AssetID : props.match.params.assetID,
        NewDevice: {
          DisplayName: '',
          SerialNumber: ''
        },
        errors: {
        },
        addNewDeviceModalOpen: false,
        /*
        Devices: [{
          DeviceID: "11111",
          DeviceName: "Device1",
          SerialNumber: "02A002",
          Variables: [
            {
              varName: "Temp",
              varID: "12345",
              LastTimeStamp: 12345
            },
            {
              varName: "Hum",
              varID: "12346",
              LastTimeStamp: 12345
            }
          ],
          Status: "Active"
        },
        {
          DeviceName: "Device2",
          Variables: [
            {
              varName: "Temp",
              varID: "12347",
              LastTimeStamp: 12345
            },
            {
              varName: "Hum",
              varID: "12348",
              LastTimeStamp: 12345
            },
            {
              varName: "Test",
              varID: "12349",
              LastTimeStamp: 12345
            }
          ],
          Status: "Inactive"
        },
        {
          DeviceName: "Device3",
          SerialNumber: "02A100",
          Variables: [
            {
              varName: "Temp",
              varID: "12350",
              LastTimeStamp: 12345
            },
            {
              varName: "Hum",
              varID: "12351",
              LastTimeStamp: 12345
            }
          ],
          Status: "Inactive"
        }
        ]*/
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    if (this.state.AssetID)
    {
      this.props.dispatch(deviceActions.getAllDeviceData(this.user, this.state.AssetID));
    }
    this.updateDeviceState = this.updateDeviceState.bind(this);
    this.AddNewDeviceToAsset = this.AddNewDeviceToAsset.bind(this);
    this.SelectDelDeviceID = this.SelectDelDeviceID.bind(this);
    this.DeleteSelectedDevice = this.DeleteSelectedDevice.bind(this);
    this.AddNewDeviceModalOpen = this.AddNewDeviceModalOpen.bind(this);
    this.AddNewDeviceModalClose = this.AddNewDeviceModalClose.bind(this);
  }

  updateDeviceState(event) {
    const field = event.target.name;
    let device = Object.assign({}, this.state.NewDevice);
    device[field] = event.target.value;
    this.setState({errors: {}});
    return this.setState({NewDevice: device});
  }

  AddNewDeviceToAsset(event) {
    //console.log(this.state);
    // validate input
    if (this.state.NewDevice.DisplayName === "") {
      this.setState({errors: {DisplayName: "Name cannot be empty"}});
      return;
    }

    this.props.dispatch(deviceActions.addNewDevice(this.user, this.state.AssetID, this.state.NewDevice));
    this.AddNewDeviceModalClose();
    toastr.info("Adding Device " + this.state.NewDevice.DisplayName);
  }

  DeleteSelectedDevice(event) {
    this.props.dispatch(deviceActions.deleteDevice(this.user, this.state.AssetID, this.state.DeivceIDSelect));
  }

  SelectDelDeviceID(deviceid) {
    this.setState({DeivceIDSelect: deviceid});
  }

  AddNewDeviceModalOpen() {
    this.setState({
      addNewDeviceModalOpen: true,
      NewDevice: {
        DisplayName: '',
        SerialNumber: ''
      }});
  }

  AddNewDeviceModalClose() {
    this.setState({addNewDeviceModalOpen: false});
  }

  render() {
    const { AssetID } = this.state;
    const { devices } = this.props;

    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
          <div className="mt-3" >
            <div className="container-fluid">
               {devices ?
                <div className="row">
                  {devices.map((item,i) =>
                    <DeviceCard key={i} device={item} assetid={AssetID} onSelDel={this.SelectDelDeviceID} />
                  )}
                  <NewDeviceCard onAddNewDevice={this.AddNewDeviceModalOpen}/>
                </div> :
                <Loader />
              }
            </div>
            <AddNewDeviceModal
              device={this.state.NewDevice}
              onChange={this.updateDeviceState}
              errors={this.state.errors}
              onAdd={this.AddNewDeviceToAsset}
              isOpen={this.state.addNewDeviceModalOpen}
              onClose={this.AddNewDeviceModalClose}
            />
            <DeleteDeviceModal
              onDel={this.DeleteSelectedDevice}
            />
          </div>
      );
    }

  }
}

const mapStateToProps = (state) => {
  const { data, addedData, error } = state.device

  if (addedData)
  {
    toastr.success("Device added!");
  }

  if (error)
  {
    toastr.warning(error);
  }

  return {
      devices : data
  };
};

const connectedPage = connect(mapStateToProps)(AssetDevice);
export { connectedPage as AssetDevice };
