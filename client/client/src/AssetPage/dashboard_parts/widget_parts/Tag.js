import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Radar } from './Radar';
import { Table } from './Table';

class Tag extends React.Component {
  constructor(props){
    super(props);
}

  render(){
    return(
      <Container>
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
            <Table className="col"/>
          </Col>
        </Row>
      </Container>
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
