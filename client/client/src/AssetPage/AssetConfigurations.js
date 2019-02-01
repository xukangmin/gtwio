import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import { deviceActions } from '../_actions/deviceAction';
import './asset.css';
import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import { TabContent, TabPane, Nav, NavItem, NavLink, Table, Row, Col } from 'reactstrap';
import classnames from 'classnames';

const DeviceTableRow = (props) => {
  return(
      <tr>
        <td>{props.data.SerialNumber}</td>
        <td>{props.data.Parameters[0].ParameterID}</td>
        <td>{props.data.Tag}</td>
        <td>{props.data.LastCalibrationDate}</td>
      </tr>
  );
};

class AssetConfigurations extends React.Component {
  constructor(props) {
    super(props);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.asset =  props.match.params.assetID;
    this.props.dispatch(deviceActions.getAllDeviceData(this.user, this.asset));

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const { device } = this.props;
    console.log(device)
    return (
      <div>
        {device?
          <div>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}
                >
                  Devices
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  Parameters & Calculations
                </NavLink>
              </NavItem>
            </Nav>

          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
                <Row>
                  <Col>
                    <div className="table-responsive">
                        <table className="table table-striped" style={{textAlign:'center'}}>
                            <thead>
                                <tr>
                                    <th>Serial Numer</th>
                                    <th>Parameter</th>
                                    <th>Location Tag</th>
                                    <th>Last Calibration</th>
                                </tr>
                            </thead>
                            <tbody id="main-table-content">
                                {device.map((singleDevice,i) =>
                                    <DeviceTableRow data={singleDevice} key={i}/>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </Col>
                </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>

              </Row>
            </TabPane>
          </TabContent>
          </div>
        :
        <Loader/>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.device;
  return {
      device : data
  };
}

const connectedPage = connect(mapStateToProps)(AssetConfigurations);
export { connectedPage as AssetConfigurations };
