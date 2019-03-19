import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { assetActions } from '../../../_actions/assetAction';
import { dataActions } from '../../../_actions/dataAction';
import { TabContent, TabPane, Nav, NavItem, NavLink, Container, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { TagRadar } from './TagRadar';
import { TagPlot } from './TagPlot';
import { ParameterPlot } from './ParameterPlot';
import { TagTable } from './TagTable';

import Loader from '../../../_components/loader';

class HxTag extends React.Component {
  constructor(props){
    super(props);
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
    }
  }

  toggle(tab) {

    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render(){
    const { AssetData } = this.props;
    const { DeviceData } = this.props;

    return(
      <div>
        {AssetData && DeviceData ?
          <div>
            <h3>{AssetData.DisplayName} - {this.props.match.params.tagID}</h3>

            <Nav tabs className = "mt-2">
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}
                >
                  Temperature
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  Flow Rate
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  <div className = "col-8"><TagPlot data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}/></div>
                  <div className = "col-4"><TagRadar data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")}/></div>
                </Row>
                <Row>
                  <Col>
                    <TagTable data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} asset = {AssetData.AssetID} unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}/>
                  </Col>
                  <Col>
                  </Col>
              </Row>
              </TabPane>
            </TabContent>

            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="2">
              <Row>
                <div className = "col-8">
                  <TagPlot data={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")} unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}/>
                </div>
              </Row>
              <Row>
                <Col>
                  <TagTable data={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")} asset = {AssetData.AssetID} unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}/>
                </Col>
                <Col>
                </Col>
              </Row>
              </TabPane>
            </TabContent>

          </div>
          :
          <Loader/>
      }
      </div>
    );
  }
}

function mapStateToProps(state) {
  const asset = state.asset.data;
  const device = state.data.data;

  return {
      AssetData : asset,
      DeviceData: device
  };
}

const connectedPage = connect(mapStateToProps)(HxTag);
export { connectedPage as HxTag };
