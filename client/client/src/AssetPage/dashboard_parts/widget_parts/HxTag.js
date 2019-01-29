import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { TempRadar } from './TempRadar';
import { TempPlot } from './TempPlot';
import { TempTable } from './TempTable';
import { assetActions } from '../../../_actions/assetAction';
import { dataActions } from '../../../_actions/dataAction';
import Loader from '../../../_components/loader';

class HxTag extends React.Component {
  constructor(props){
    super(props);
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
    this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID, props.match.params.tagID, Date.now()-600000, Date.now()));
  }

  render(){
    const { AssetData } = this.props;
    const { DeviceData } = this.props;
    return(
      <div>
        {AssetData && DeviceData ?
          <div>
            <Breadcrumb style={{display: "none"}}>
              <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
              <BreadcrumbItem><a href={"/asset/"+AssetData.AssetID+"/dashboard"}>{AssetData.DisplayName}</a></BreadcrumbItem>
              <BreadcrumbItem><a href="#">{this.props.match.params.tagID}</a></BreadcrumbItem>
            </Breadcrumb>
            <Row>
              <Col md="8"><TempPlot data={DeviceData}/></Col>
              <Col><TempRadar data={DeviceData}/></Col>
            </Row>
            <Row>
              <Col><TempTable data={DeviceData}/></Col>
              <Col></Col>
            </Row>
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
