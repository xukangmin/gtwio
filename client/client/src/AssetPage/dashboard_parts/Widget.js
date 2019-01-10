import React from 'react';
import { connect } from 'react-redux';
import Loader from '../../_components/loader';
import { renderRoutes } from 'react-router-config';
import { NavLink } from 'react-router-dom';
import Line from './widget_parts/Line';

class Widget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
  }

  render() {
    return (
    <div  {...this.props} >
        <div className="container-fluid">
            <div className="row mt-2">
                <div className="col">{this.props.name}</div>
                <div className="col">Toolbar</div>
            </div>
            {this.props.resizestatus === 0 &&
            <div className="row" >
                <Line 
                    index={this.props.index} 
                    pTotalWidth={this.props.totalwidth} 
                    pWidth={this.props.style.width} 
                    pHeight={parseFloat(this.props.style.height)} 
                />
            </div>    
            }

        </div>
        {this.props.children}
    </div>
    );
  }
}

export default Widget;
