import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { assetActions } from '../../../_actions/assetAction';
import { dataActions } from '../../../_actions/dataAction';
import { Container, Row, Col } from 'reactstrap';
import { TagRadar } from './TagRadar';
import { TagPlot } from './TagPlot';
import { TagTable } from './TagTable';

import Loader from '../../../_components/loader';

class HxTag extends React.Component {
  constructor(props){
    super(props);
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
    this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.match.params.assetID, this.props.match.params.tagID, Date.now()-600000, Date.now()));
  }

  render(){
    const { AssetData } = this.props;
    const { DeviceData } = this.props;

    return(
      <div>
        {AssetData && DeviceData ?
          <div>
            <h3 className = "mt-3">{AssetData.DisplayName} - {this.props.match.params.tagID}</h3>

            <Row>
              <div className = "col-8"><TagPlot asset = {AssetData.AssetID} tag = {this.props.match.params.tagID}/></div>
              <div className = "col-4"><TagRadar/></div>
            </Row>
            <Row>
              <Col className = "mt-5"><TagTable asset = {AssetData.AssetID}/></Col>
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
