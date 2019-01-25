import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class Progressbar extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    const percentage = 66;
    const barColor = percentage > 60 ? "rgb(8, 216, 0)" : "red";
    const barStyle = {
      maxWidth: "200px",
      margin: "0 50px",
      textAlign: "c"
    }
    const titleStyle = {
      marginTop: "10px",
      fontWeight: "bold"
    }
    return(
      <div style={barStyle}>
        <div className="mx-auto" style={{width: "100px"}}>
          <CircularProgressbar
            percentage={percentage}
            text={`${percentage}%`}
            strokeWidth={4}
            styles={{
              path: { stroke: barColor, strokeLinecap: 'butt' },
              text: { fill: barColor, fontSize: '30px' }
            }}
          />
        </div>
        <span style={titleStyle}>{this.props.type}</span>
      </div>)
  }
}

function mapStateToProps(state) {
  return({});
}

const connectedPage = connect(mapStateToProps)(Progressbar);
export { connectedPage as Progressbar };
