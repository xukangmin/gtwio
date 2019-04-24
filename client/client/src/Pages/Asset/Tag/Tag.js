import React from 'react';
import { connect } from 'react-redux';
import { assetActions } from '../../../_actions/assetAction';
import { TabContent, Nav, NavItem, NavLink, Container, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { Radar } from '../../../Widgets/Radar';
import { MultipleLinesPlot } from '../../../Widgets/MultipleLinesPlot';
import { SingleLinePlot } from '../../../Widgets/SingleLinePlot';
import { Table } from '../../../Widgets/Table';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
const queryString = require('query-string');
import EmptyData from '../../../Widgets/EmptyData';
import Loader from '../../../Widgets/Loader';

class Tag extends React.Component {
  constructor(props){
    super(props);

    this.props.dispatch(assetActions.getAsset(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));    
  }

  render(){
    const { AssetData } = this.props;
    const { DeviceData } = this.props;

    function callback(key) {
      console.log(key);
    }

    let defaultActive = "1";
    if (queryString.parse(location.search).tab){
      if (DeviceData && DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").length>0 && queryString.parse(location.search).tab.toString()=="2"){
        defaultActive = "2";
      }
    }    
    
    return(
      <div>
        {AssetData && DeviceData ?
          <div>
            <h3>{AssetData.DisplayName} - {this.props.match.params.tagID}</h3>
            {DeviceData[0].Parameters[0].Data.length?
              <Tabs onChange={callback} type="card" defaultActiveKey={defaultActive}>
              <TabPane tab="Temperature" key="1">
              <Row>
                <div className = "col-8">
                  <MultipleLinesPlot 
                    data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} 
                    unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}/>
                </div>
                <div className = "col-4">
                  {DeviceData[0].Parameters[0].DataStatistics?
                    <Radar data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")}/>
                  :<div></div>}
                  
                </div>
              </Row>
              <Row>
                <Col>
                {DeviceData[0].Parameters[0].DataStatistics?
                    <Table 
                    data={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature")} 
                    asset={AssetData.AssetID} 
                    unit={DeviceData.filter(item=>item.Parameters[0].Type=="Temperature").map(item=>item.Parameters[0].Unit)[0]}
                  />
                  :<div></div>}
                  
                </Col>
                <Col>
                </Col>
              </Row>
              </TabPane>
              
              {DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").length>0 &&
              <TabPane tab="Flow Rate" key="2">
                <Row>
                  <Col>
                    <SingleLinePlot 
                      parameterData={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")[0].Parameters[0].Data} 
                      unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table 
                      data={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate")} 
                      asset={AssetData.AssetID} 
                      unit={DeviceData.filter(item=>item.Parameters[0].Type=="FlowRate").map(item=>item.Parameters[0].Unit)[0]}
                    />
                  </Col>
                  <Col>
                  </Col>
                </Row>
              </TabPane>}
              </Tabs>
            :
            <EmptyData/>
            }
            
          </div>
          :
          <Loader/>}      
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
