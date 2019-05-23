import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import moment from "moment";
import { assetActions } from '../_actions/assetAction';

class MultipleLinesPlot extends React.Component {
  constructor(props){
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick (data) {
    let x = data.points[0].x;
    let y = data.points[0].y;
   
    console.log(x);
    let baseline = [{
      TimeStamp: moment(x.toString(),"MMMM Do, H:mm").format('x'),
      Active: 1
    }]

    let confirmBaseline = confirm (`update baseline to ${x}?`);
    if (confirmBaseline){
      this.props.dispatch(assetActions.updateBaseline(this.props.user, this.props.asset, baseline));
    }
    
    // let {selectedPoints} = this.state;
     
    // let selectedIndex = selectedPoints.x.indexOf(x)
    // if(selectedIndex === -1) {
    //    newSelected = {
    //      x:selectedPoints.x.push(x),
    //      y:selectedPoints.y.push(y)
    //    }
    // } else {
    //    newSelected = {
    //       x: selectedPoints.x.delete(selectedIndex),
    //       y: selectedPoints.y.delete(selectedIndex)
    //    }
    // }

    // this.setState({
    //   selectedPoints:newSelected
    // })

  }

  render(){
    const { data } = this.props;
    const { unit } = this.props;

    let isRangeBiggerThanADay = false;
    let formattedData = [];
    let allData = [];
    let layout = {};

    if (this.props.for != 'baseline'){
      if (JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).interval)>=1440){
        isRangeBiggerThanADay = true;
      } else if (!JSON.parse(localStorage.getItem('range')).live && parseInt(JSON.parse(localStorage.getItem('range')).end) - parseInt(JSON.parse(localStorage.getItem('range')).start)>=86400){
        isRangeBiggerThanADay = true;
      }   
  
      for (var i = 0; i < data.length; i++){
        formattedData.push({
          x: data[i].Parameters[0].Data.map((item,i) => isRangeBiggerThanADay ? moment(new Date(item.TimeStamp)).format('MMMM Do YYYY, H:mm') : moment(new Date(item.TimeStamp)).format("H:mm")),
          y: data[i].Parameters[0].Data.map((item,i) => item.Value.toFixed(2)),
          type: 'scatter',
          name: data[i].SerialNumber
        });
        allData.push(data[i].Parameters[0].Data.map((item,i) => item.Value));
      }

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

    } else {
      isRangeBiggerThanADay = true;
      for (var i = 0; i < data.length; i++){
        formattedData.push({
          x: data[i].Data.map((item,i) => moment(new Date(item.TimeStamp)).format('MMMM Do, H:mm')),
          // x: data[i].Data.map((item,i) => item.TimeStamp),
          y: data[i].Data.map((item,i) => item.Value.toFixed(2)),
          type: 'scatter',
          name: data[i].Tag
        });
      }

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
        margin:{
          l: 50,
          t: 30
        },
        legend: {
          orientation: 'h'
        }
      }      
    }
      

    return(
      <div>
        <h3 style={{textAlign: "center"}}> Baseline: {this.state.activeBaseline === -1 ? 'N/A' : moment(this.state.baselines[this.state.activeBaseline].TimeStamp).format('YYYY-MM-DD H:mm')}</h3>
        <hr/>
        <Plot
          data = {formattedData}
          layout = {layout}
          style = {{width:"100%"}}
          onClick = {this.onClick}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(MultipleLinesPlot);
export { connectedPage as MultipleLinesPlot };
