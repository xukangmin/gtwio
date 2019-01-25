import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { TempRadar } from './TempRadar';
import { TempPlot } from './TempPlot';
import { TempTable } from './TempTable';
import { assetActions } from '../../../_actions/assetAction';
import Loader from '../../../_components/loader';
import TagData from '../../../data/GetDataByTag.json'

class HxTag extends React.Component {
  constructor(props){
    super(props);
    this.state={
      data: TagData
    }
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
  }

  render(){
    const { AssetData } = this.props;
    return(
      <div>
        {AssetData ?
          <div>
            <Breadcrumb>
              <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
              <BreadcrumbItem><a href={"/asset/"+AssetData.AssetID+"/dashboard"}>{AssetData.DisplayName}</a></BreadcrumbItem>
              <BreadcrumbItem><a href="#">Tag: </a></BreadcrumbItem>
            </Breadcrumb>
            <Row>
              <Col><TempPlot data={this.state.data}/></Col>
              <Col><TempRadar data={this.state.data}/></Col>
            </Row>
            <Row>
              <Col><TempTable data={this.state.data}/></Col>
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
  const { data } = state.asset;
  return {
      AssetData : data
  };
}

const connectedPage = connect(mapStateToProps)(HxTag);
export { connectedPage as HxTag };
