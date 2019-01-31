import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import { dataActions } from '../../../_actions/dataAction';

class TempPlot extends React.Component {
  constructor(props){

    super(props);
    this.state={
      layout : {
        yaxis: {
          range: [0,100]
        }
      },
      interval: 60
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({interval: event.target.value});
    // this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, Date.now()-this.state.interval*10000, Date.now()));
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render(){
    this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, Date.now()-this.state.interval*60*1000, Date.now()));
    let { DeviceData } = this.props;
    console.log("render")
    let temp = []
    for (var i=0; i<DeviceData.length; i++){
      temp.push({
        x: DeviceData[i].Data.map((item,i)=>new Date(item.TimeStamp).toLocaleTimeString("en-US")),
        y: DeviceData[i].Data.map((item,i)=>item.Value),
        type: 'scatter',
        name: DeviceData[i].SerialNumber
      })
    }

    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            {"Show  "}
            <select value={this.state.interval} onChange={this.handleChange}>
              <option value="10">10 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <input style={{display: "none"}} type="submit" value="Submit" />
        </form>
        <Plot
            data={temp}
            layout={this.state.layout}
            style={{width:"100%"}}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const device = state.data.data;

  return {
      DeviceData: device
  };
}

const connectedPage = connect(mapStateToProps)(TempPlot);
export { connectedPage as TempPlot };
