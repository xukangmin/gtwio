import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import moment from "moment";
import { assetActions } from '../_actions/assetAction';
import Loader from './Loader';

class MultipleLinesPlot extends React.Component {
  constructor(props){
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick (data) {
    if(this.props.for === "baseline"){
      let x = data.points[0].x;
      let y = data.points[0].y;

      let newBaseline = [{
        TimeStamp: moment(x.toString(),"MMMM Do, H:mm").format('x'),
        Active: 1
      }]

      let confirmBaseline = confirm (`update baseline to ${x}?`);
      if (confirmBaseline){
        this.baseline = moment(x.toString(),"MMMM Do, H:mm").format('x');
        this.props.dispatch(assetActions.updateBaseline(this.props.user, this.props.asset, newBaseline));
        this.forceUpdate();
      }    
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.assetData !== nextProps.assetData ) {
      return true;
    }
    return false;
  }

  render(){
    const { data } = this.props;
    const { unit } = this.props;
    const { type } =this.props;

    let isRangeBiggerThanADay = false;
    let formattedData = [];
    let allData = [];
    let layout = {};
    let baseline = undefined;
    let dataDone = false;

    console.log(data)
    if(this.props.assetData && this.props.assetData.Settings){
      baseline = this.props.assetData.Settings.Baselines.length ? this.props.assetData.Settings.Baselines[0].TimeStamp : undefined ;
    }    

    if (this.props.for != 'baseline'){
      if (JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).interval)>=1440){
        isRangeBiggerThanADay = true;
      } else if (!JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).end) - parseInt(JSON.parse(localStorage.getItem('range')).start)>=86400){
        isRangeBiggerThanADay = true;
      }   
  
      for (var i = 0; i < data.length; i++){
        formattedData.push({
          x: data[i].Parameters.find(item=>item.Type==type).Data.map((item,i) => isRangeBiggerThanADay ? moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm') : moment(new Date(item.TimeStamp)).format("H:mm")),
          y: data[i].Parameters.find(item=>item.Type==type).Data.map((item,i) => item.Value.toFixed(2)),
          type: 'scatter',
          name: data[i].SerialNumber
        });
        allData.push(data[i].Parameters.find(item=>item.Type==type).Data.map((item,i) => item.Value));
      }
      dataDone = true;

      layout = {
        title: 'Line Chart',
        yaxis: {
          range: [Math.min(...allData[0])-10,Math.max(...allData[0])+10],
          ticklen: 8,
          title: "("+unit+")"
        },
        xaxis: {
          showline: false,
          autotick: true,
          ticklen: 8,
          nticks: 10
        },
        margin:{
          l: 50,
          t: 30
        }
      }

    } else if (data){
      isRangeBiggerThanADay = true;
      
      let addData = function() {
        for (var i = 0; i < data.length; i++){
        formattedData.push({
          x: data[i].Data.map((item,i) => item.TimeStamp ? moment(new Date(item.TimeStamp)).format('MMMM Do, H:mm'): 0),
          y: data[i].Data.map((item,i) => item.Value ? item.Value.toFixed(2) : 0),
          type: 'scatter',
          name: data[i].Tag.split(':')[0] + parseInt(data[i].Tag.split(':')[1])/60000 + "min",
          legendgroup: data[i].Tag.split(':')[1]
        });
      }
      dataDone = true;
    }();
      

      layout = {
        yaxis: {
          range: [0, 0.2],
          ticklen: 8
        },
        xaxis: {
          showline: false,
          autotick: true,
          ticklen: 8,
          nticks: 10,
          tickfont: { size: 10},
          spikemode: 'toaxis'
        },
        shapes: [
          {
           type: 'line',
           x0: baseline ? moment(new Date(baseline)).format('MMMM Do, H:mm') : 0,
           y0: 0,
           x1: baseline ? moment(new Date(baseline)).format('MMMM Do, H:mm') : 0,
           y1: baseline ? 0.2 : 0,
           line: {
             color: 'red',
             width: baseline ? 3 : 0
           }
         }
      ],
      annotations: [ baseline ?
        {
          xref: 'x',
          yref: 'y',
          x: moment(new Date(baseline)).format('MMMM Do, H:mm'),
          xanchor: 'center',
          y: 0.2,
          yanchor: 'bottom',
          text: 'current baseline',
          showarrow: false,
          font: { color: 'red'}
        } : ""
      ],
        margin:{
          l: 50,
          t: 30
        },
        legend: {
          orientation: 'h',
          xanchor: 'center',
          yanchor: 'bottom',
          x: 0.5,
          y: -0.3
        }
      }      
    }
      

    return(
      
      <div>
        <h4 style={{textAlign: "center", display: this.props.for ==='baseline' ? 'block' : 'none'}}>Baseline: {baseline ? moment(new Date(baseline)).format('YYYY MMMM Do, H:mm') : "N/A"}</h4>
        {dataDone ?
        <Plot
          data = {formattedData ? formattedData : []}
          layout = {layout}
          style = {{width:"100%"}}
          onClick = {this.onClick}
        />:
        <Loader/>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    assetData: state.asset.data
  };
}

const connectedPage = connect(mapStateToProps)(MultipleLinesPlot);
export { connectedPage as MultipleLinesPlot };
