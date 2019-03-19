import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { assetActions } from '../../../_actions/assetAction';
import { dataActions } from '../../../_actions/dataAction';
import { Container, Row, Col } from 'reactstrap';
import { TagRadar } from './TagRadar';
import { ParameterPlot } from './ParameterPlot';
import { matchRoutes } from 'react-router-config';
import routes from '../../../_routes/routes';
import Loader from '../../../_components/loader';

class HxFlow extends React.Component {
  constructor(props){
    super(props);
    var m_res = matchRoutes(routes, window.location.pathname);
    for(var item in m_res) {
        if (m_res[item].match.isExact) {
          this.asset = m_res[item].match.params.assetID;
          this.flow = m_res[item].match.params.flowID;
        }
      }
    }


  render(){
    const { data } = this.props;

    return(
      <div>

      {data ?
        <div>
          <h3 className = "mt-3">{this.asset} - {this.flow}</h3>
          <ParameterPlot unit="(gpm)"/>
        </div>
        :
        <Loader/>
      }
      </div>
    );
  }
}

function mapStateToProps(state) {
  const data = state.data.data;

  return {
      data : data
  };
}

const connectedPage = connect(mapStateToProps)(HxFlow);
export { connectedPage as HxFlow };
