import React from 'react';
import { connect } from 'react-redux';
import { assetActions } from '../../../_actions/assetAction';
import { TabContent, TabPane, Nav, NavItem, NavLink, Container, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { Radar } from '../../../Widgets/Radar';
import { MultipleLinesPlot } from '../../../Widgets/MultipleLinesPlot';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';
import { Table } from '../../../Widgets/Table';
const queryString = require('query-string');

import Loader from '../../../Widgets/Loader';

class Tag extends React.Component {
  constructor(props){
    super(props);

    this.props.dispatch(assetActions.getAsset(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
    }
  }

  toggle(tab) {
    // removeQuery('tab');
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  componentDidMount(){
    if(document.getElementById("flowTab") && queryString.parse(location.search).tab.toString()=="2"){
      document.getElementById("flowTab").click();
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

              {DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").length>0 ?
              <NavItem style={{display: DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").length>0 ? "list-item" : "none"}}>
                <NavLink
                  id="flowTab"
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  Flow Rate
                </NavLink>
              </NavItem>
              :
              <div></div>}              
            </Nav>

            <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                  <Row>
                    <div className = "col-8"><MultipleLinesPlot data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}/></div>
                    <div className = "col-4"><Radar data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")}/></div>
                  </Row>
                  <Row>
                    <Col>
                      <Table data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} asset = {AssetData.AssetID} unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}/>
                    </Col>
                    <Col>
                    </Col>
                  </Row>
                </TabPane>
            </TabContent>

            {DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").length>0 ?
              <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="2">
                <Row>
                  <Col>
                    <SingleLinePlot parameterData={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")[0].Parameters[0].Data} flow={true} unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}/>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table data={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")} asset = {AssetData.AssetID} unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}/>
                  </Col>
                  <Col>
                  </Col>
                </Row>
                </TabPane>
              </TabContent>
              :
              <div></div>
            }
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

const connectedPage = connect(mapStateToProps)(Tag);
export { connectedPage as Tag };
