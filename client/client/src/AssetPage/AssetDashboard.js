import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import './asset.css';
import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import ReactGridLayout from 'react-grid-layout';
import Widget from './dashboard_parts/Widget'
import update from 'immutability-helper';
import { AddNewWidgetModal } from './dashboard_parts/AddNewWidgetModal';
import { dashboardActions } from '../_actions/dashboardAction';

function createDefaultDashboard(assetid, dispatch) {
    dispatch(dashboardAction.addDashboard(assetid, {

    }));
}


class AssetDashboard extends React.Component {
  constructor(props) {
    super(props);
    // this.props.dispatch(dashboardActions.getDashboards(props.match.params.assetID));
    console.log(this.state)
    this.state = {
        AssetID : props.match.params.assetID,
        totalwidth: 1500,
        lock: false,
        addNewWidgetModalOpen: false,
        newWidget: {
          Title: "new widget test",
          Layoutdata: {
            minW: 4,
            minH: 8
          },
          Type: "hx"
        },
        dashboardData:{

        }
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStartHandle = this.onDragStartHandle.bind(this);
    this.onDragStopHandle = this.onDragStopHandle.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.onLock = this.onLock.bind(this);
    this.AddNewWidgetModalOpen = this.AddNewWidgetModalOpen.bind(this);
    this.AddNewWidgetModalClose = this.AddNewWidgetModalClose.bind(this);
  }



  componentDidMount() {
  }

  onDragStartHandle(layout, oldItem, newItem,
    placeholder, e, element) {
  }

  onDragStopHandle(layout, oldItem, newItem,
    placeholder, e, element) {
      const newLayout = layout;
      // console.log(layout[0])
      let widgets = this.props.dashboardData[0].Widgets;
      // console.log(widgets.length)
      for(var i=0;i<widgets.length;i++){
        widgets[i].Layoutdata=layout[i]
      }
      // for (var singleLayout in layout){
        console.log(widgets)
      // }
      // let newDashboardData = this.props.dashboardData;
      // this.props.dashboardData[0].Widgets = Widgets;
      // this.props.dispatch(dashboardActions.updateDashboard(newDashboardData[0]));
  }

  onResizeStop(layout, oldItem, newItem,
    placeholder, e, element) {
      const el_index = parseInt(element.parentElement.getAttribute("index"));
      const widgets = this.props.dashboardData[0].Widgets;
      widgets[el_index].resizeStatus = 0;
      this.forceUpdate();
  }

  onResizeStart(layout, oldItem, newItem,
    placeholder, e, element) {
    const el_index = parseInt(element.parentElement.getAttribute("index"));
    const widgets = this.props.dashboardData[0].Widgets;

    widgets[el_index].resizeStatus = 1;
    this.forceUpdate();
  }

  onLock() {
    this.setState({lockStatus: 1});
    this.setState({lock: !this.state.lock});
  }

  AddNewWidgetModalOpen() {
    this.setState({addNewWidgetModalOpen: true});
  }

  AddNewWidgetModalClose() {
    this.setState({addNewWidgetModalOpen: false});
  }

  render() {
    //const { assets } = this.state;
    const { AssetID, lock } = this.state;
    const lockIcon = <i  className="dashboard-toolbar-icon fas fa-lock"></i>
    const unlockIcon = <i  className="dashboard-toolbar-icon fas fa-lock-open"></i>
    const { dashboardData } = this.props;
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div>
        {dashboardData ?
          <div className="container-fluid">
            <div className="row m-auto">
              <div className="float-left m-1">
                <a onClick={this.onLock}>
                    <span className={ lock ? 'd-none' : '' }>{ unlockIcon }</span>
                    <span className={ lock ? '' : 'd-none' }>{ lockIcon }</span>
                </a>
              </div>
              <div className="float-left m-1">
                <a onClick={this.AddNewWidgetModalOpen}>
                    <i className="dashboard-toolbar-icon fas fa-plus-square"></i>
                </a>
              </div>
              <div className="float-left m-1"><i className="dashboard-toolbar-icon fas fa-trash-alt"></i></div>
            </div>
            <div className="row">

              <ReactGridLayout className="layout" cols={12} rowHeight={30} width={this.state.totalwidth} onDragStart={this.onDragStartHandle} onDragStop={this.onDragStopHandle} onResizeStop={this.onResizeStop} onResizeStart={this.onResizeStart} draggableCancel=".NonDraggableAreaPlot" isDraggable={!this.state.lock} >
                  {dashboardData[0].Widgets.map((item,i) =>
                    <Widget key={i} data-grid={item.Layoutdata} index={i} name={item.Title} type={item.Type} resizestatus={0} curw={item.height} curh={item.width} totalwidth={this.state.totalwidth}/>
                  )}
              </ReactGridLayout>
            </div>
          </div>
          :
          <Loader />}
          <AddNewWidgetModal
              isOpen={this.state.addNewWidgetModalOpen}
              onClose={this.AddNewWidgetModalClose}
              assetID={this.state.AssetID}
              widgetData={this.state.newWidget}
          />
      </div>
      );
    }

  }
}

function mapStateToProps(state) {
  const { data } = state.dashboard;
  return {
      dashboardData : data
  };
}

const connectedPage = connect(mapStateToProps)(AssetDashboard);
export { connectedPage as AssetDashboard };
