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

class AssetDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        AssetID : props.match.params.assetID,
        totalwidth: 1500,
        lock: false,
        addNewWidgetModalOpen: false,
        dashboarddata: {
          dashboardID: "12345",
          widgets: [
            {
              name: "Temperature",
              layoutdata: {x: 0, y: 0, w: 4, h: 6},
              type: "linechart",
              datasource: {
                VarID: "12354",
                StartTimeStamp: 1,
                EndTimeStamp: 5
              }
            },
            {
              name: "Humidity",
              layoutdata: {x: 4, y: 0, w: 4, h: 6},
              type: "linechart",
              datasource: {
                VarID: "12354",
                StartTimeStamp: 1,
                EndTimeStamp: 5
              }
            },
            {
              name: "Test",
              layoutdata: {x: 0, y: 12, w: 4, h: 6},
              type: "linechart",
              datasource: {
                VarID: "12354",
                StartTimeStamp: 1,
                EndTimeStamp: 5
              }
            },
            {
              name: "Hx",
              layoutdata: {x: 0, y: 18, w: 4, h: 7},
              type: "hx",
              datasource: {
                VarID: "12354",
                StartTimeStamp: 1,
                EndTimeStamp: 5
              }
            }
          ]
        }
    }

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStartHandle = this.onDragStartHandle.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.updateCursor = this.updateCursor.bind(this);
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

  }

  onResizeStop(layout, oldItem, newItem,
    placeholder, e, element) {
      /*
      const index = parseInt(element.parentElement.getAttribute("index"));
      const stateCopy = Object.assign({}, this.state);
      stateCopy.dashboarddata.widgets = stateCopy.dashboarddata.widgets.slice();
      stateCopy.dashboarddata.widgets[index] = Object.assign({}, stateCopy.dashboarddata.widgets[index]);
      console.log(index);
      console.log(layout[0]);
      stateCopy.dashboarddata.widgets[index].layoutdata = layout[index];
      console.log(stateCopy);
      this.setState(stateCopy);
      console.log(this.state);*/

      const el_index = parseInt(element.parentElement.getAttribute("index"));

      const widgets = this.state.dashboarddata.widgets;
      widgets[el_index].resizeStatus = 0;

      this.forceUpdate();

  }

  onResizeStart(layout, oldItem, newItem,
    placeholder, e, element) {
    const el_index = parseInt(element.parentElement.getAttribute("index"));

    const widgets = this.state.dashboarddata.widgets;
    widgets[el_index].resizeStatus = 1;

    this.forceUpdate();
  }

  updateCursor(event){
    event.type === "mouseenter"? document.documentElement.style.cursor = "move" : document.documentElement.style.cursor = "default"
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
    const { AssetID, dashboarddata, lock } = this.state;
    const lockIcon = <i  className="dashboard-toolbar-icon fas fa-lock"></i>
    const unlockIcon = <i  className="dashboard-toolbar-icon fas fa-lock-open"></i>
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div>
        {dashboarddata ?
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
              <div className="float-left m-1"> <i className="dashboard-toolbar-icon fas fa-trash-alt"></i></div>
            </div>
            <div className="row">
              <ReactGridLayout className="layout" cols={12} rowHeight={30} width={this.state.totalwidth} onDragStart={this.onDragStartHandle} onDragStop={this.onDragStopHandle} onResizeStop={this.onResizeStop} onResizeStart={this.onResizeStart} draggableCancel=".NonDraggableAreaPlot" isDraggable={!this.state.lock} >
                  {dashboarddata.widgets.map((item,i) =>
                    <Widget key={i} data-grid={item.layoutdata} index={i} name={item.name} type={item.type} curw={item.height} curh={item.width} totalwidth={this.state.totalwidth} resizestatus={0} onMouseEnter={this.updateCursor} onMouseLeave={this.updateCursor}/>
                  )}
              </ReactGridLayout>
            </div>
          </div>
          :
          <Loader />}
          <AddNewWidgetModal
              isOpen={this.state.addNewWidgetModalOpen}
              onClose={this.AddNewWidgetModalClose}
          />
      </div>
      );
    }

  }
}

function mapStateToProps(state) {
  const { data, msg } = state.data
  return {
      assets : data,
      msg: msg
  };
}

const connectedPage = connect(mapStateToProps)(AssetDashboard);
export { connectedPage as AssetDashboard };
