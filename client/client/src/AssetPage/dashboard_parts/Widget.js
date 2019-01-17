import React from 'react';
import { connect } from 'react-redux';
import Loader from '../../_components/loader';
import { renderRoutes } from 'react-router-config';
import { NavLink } from 'react-router-dom';
import Line from './widget_parts/Line';
import Hx from './widget_parts/Hx';

class Widget extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
  }

  componentDidMount () {
  }

  widgetType(){
    switch (this.props.type){
        case "linechart":
          console.log(this.props)
          return(<Line
              index={this.props.index}
              pTotalWidth={this.props.totalwidth}
              pWidth={this.props.style.width}
              pHeight={parseFloat(this.props.style.height)}
          />)
        case "hx":
          return(<Hx/>)
        }
  }

  updateCursor(event){
    event.type === "mouseenter"? document.documentElement.style.cursor = "move" : document.documentElement.style.cursor = "default"
  }

  render() {
    return (
    <div  {...this.props} >

        <div className="container-fluid">
            <div className="row pt-1" onMouseEnter={this.updateCursor} onMouseLeave={this.updateCursor} style={{backgroundColor:"gray", color:"white"}}>
                <div className="col"><h3>{this.props.name}</h3></div>
            </div>
            {this.props.resizestatus === 0 &&
              <div className="row" >
                  {this.widgetType()}
              </div>
            }

        </div>
        {this.props.children}
    </div>
    );
  }
}

export default Widget;
