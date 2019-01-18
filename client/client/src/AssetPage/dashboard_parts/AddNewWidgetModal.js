import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { dashboardActions } from '../../_actions/dashboardAction'

class AddNewWidgetModal extends React.Component {
    constructor(props){
      super(props)
      this.props.dispatch(dashboardActions.getDashboards(this.props.assetID));
      this.AddWidgetToDashboard = this.AddWidgetToDashboard.bind(this);
    }

    AddWidgetToDashboard(){
      const Widgets = this.props.dashboardData[0].Widgets.concat(this.props.widgetData);
      let newDashboardData = this.props.dashboardData;
      this.props.dashboardData[0].Widgets = Widgets;
      this.props.dispatch(dashboardActions.updateDashboard(newDashboardData[0]));
    }

    render(){
      return (
        <div>
            <Modal isOpen={this.props.isOpen} toggle={this.props.onClose} >
                <ModalHeader toggle={this.props.onClose} >Add New Widget</ModalHeader>
                <ModalBody>
                    <p>modal body</p>
                    <p>To add: {this.props.widgetData.Title}</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.AddWidgetToDashboard} >Add</Button>{' '}
                    <Button color="secondary" >Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>

    );
  }
}

function mapStateToProps(state) {
  const { data } = state.dashboard;
  return {
      dashboardData : data
  };
}

const connectedPage = connect(mapStateToProps)(AddNewWidgetModal);
export { connectedPage as AddNewWidgetModal };
