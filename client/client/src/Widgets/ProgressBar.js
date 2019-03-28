import React from 'react';
import { connect } from 'react-redux';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class Progressbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const percentage = this.props.percentage;
    const barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
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
          <span style = {unitStyle}>{this.props.unit}</span>
        </div>

        <span style = {titleStyle}>{this.props.type}</span>
      </div>)
  }
}

function mapStateToProps(state) {
}

const connectedPage = connect(mapStateToProps)(Progressbar);
export { connectedPage as Progressbar };
