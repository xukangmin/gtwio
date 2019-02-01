import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import { dataActions } from '../../../_actions/dataAction';

class TempPlot extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      plot_Interval: 10
    }

    this.dispatchTagContinuously = setInterval(() => {
      this.props.dispatch(dataActions.getSingleTagData(JSON.parse(localStorage.getItem('user')),this.props.asset, this.props.tag, Date.now()-this.state.plot_Interval*60*1000, Date.now()));
    }, 5000);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({interval: event.target.value});
  }

  render(){
    const { DeviceData } = this.props;

    let formattedData = [];

    let layout = {
      yaxis: {
        range: [0,100],
        ticklen: 8
      },
      xaxis: {
        showline: false,
        autotick: false,
        ticklen: 8,
        dtick: this.state.plot_Interval*0.8
      },
      margin:{
        l: 40,
        t: 30
      }
    }

    for (var i = 0; i < DeviceData.length; i++){
      formattedData.push({
        x: DeviceData[i].Data.map((item,i) => new Date(item.TimeStamp).toLocaleTimeString("en-US")),
        y: DeviceData[i].Data.map((item,i) => item.Value),
        type: 'scatter',
        name: DeviceData[i].SerialNumber
      })
    }

    return(
      <div>
        <label>
          {"Show  "}
          <select value = {this.state.interval} onChange = {this.handleChange}>
            <option value = "10">10 minutes</option>
            <option value = "30">30 minutes</option>
            <option value = "60">60 minutes</option>
          </select>
          {"  from  "}
          <select value = {this.state.time} onChange = {this.handleChange}>
            <option value = "10">Now</option>
          </select>
        </label>
        <Plot
          data = {formattedData}
          layout = {layout}
          style = {{width:"100%"}}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.data;
  return {
      DeviceData: data
  };
}

const connectedPage = connect(mapStateToProps)(TempPlot);
export { connectedPage as TempPlot };
