import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { TempRadar } from './TempRadar';
import { TempPlot } from './TempPlot';
import { TempTable } from './TempTable';
import { assetActions} from '../../../_actions/assetAction';
import Loader from '../../../_components/loader';

class HxTag extends React.Component {
  constructor(props){
    super(props);
    this.props.dispatch(assetActions.getSingleAssetData(JSON.parse(localStorage.getItem('user')),props.match.params.assetID));
}

  render(){
    const { assetData } = this.props;
    return(
      <div>
        {assetData ?
          <div>
            <Breadcrumb>
              <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
              <BreadcrumbItem><a href={"/asset/"+assetData.AssetID+"/dashboard"}>{assetData.DisplayName}</a></BreadcrumbItem>
              <BreadcrumbItem><a href="#">Tag: </a></BreadcrumbItem>
            </Breadcrumb>
            <Row>
              <Col><TempPlot/></Col>
              <Col><TempRadar/></Col>
            </Row>
            <Row>
              <Col><TempTable/></Col>
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
      assetData : data
  };
}

const connectedPage = connect(mapStateToProps)(HxTag);
export { connectedPage as HxTag };
