import React from 'react';
import { connect } from 'react-redux';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { type, percentage, unit } = this.props;
    let barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
        
    if (type == "HEAT_TRANSFER_RATE"){
      percentage = percentage * 100;
      unit = "%";
      barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
    } else if (type == "PERFORMANCE_FACTOR"){
      unit = "-";
      barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
    } else if (type == "TOTAL_UNCERTAINTY"){
      unit = "-";
      barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
    }

    const barStyle = {
      maxWidth: "200px",
      margin: "0 50px",
      textAlign: "center"
    }
    const titleStyle = {
      position: "relative",
      top: "-20px",
      fontWeight: "bold"
    }
    const unitStyle = {
      position: "relative",
      top: "-40px",
      textAlign: "center"
    }

    return(
      <div style = {barStyle}>
        <div className = "mx-auto" style = {{width: "100px"}}>
          <CircularProgressbar
            percentage = {percentage}
            text = {`${percentage}`}
            strokeWidth = {4}
            styles = {{
              path: {
                stroke: barColor,
                strokeLinecap: 'butt' },
              text: {
                fill: barColor,
                fontSize: '30px' }
            }}
          />
          <span style = {unitStyle}>{unit}</span>
        </div>

        <span style = {titleStyle}>{type}</span>
      </div>)
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(ProgressBar);
export { connectedPage as ProgressBar };
