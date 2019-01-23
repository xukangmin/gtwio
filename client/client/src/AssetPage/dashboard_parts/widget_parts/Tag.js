import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Radar } from './Radar';
import { TempTable } from './TempTable';

class Tag extends React.Component {
  constructor(props){
    super(props);
}

  render(){
    return(
      <div>
        <Breadcrumb>
          <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
          <BreadcrumbItem><a href="#">Asset: </a></BreadcrumbItem>
          <BreadcrumbItem><a href="#">Tag: </a></BreadcrumbItem>
        </Breadcrumb>
        <Row>
          <Col>
            <Radar className="col"/>
          </Col>
          <Col>
            <TempTable className="col"/>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(Tag);
export { connectedPage as Tag };
