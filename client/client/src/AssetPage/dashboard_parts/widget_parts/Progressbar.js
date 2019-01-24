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
    const color = percentage>60? "rgb(8, 216, 0)" : "red";
    return(
      <div style={{maxWidth: "200px", margin: "0 50px", textAlign: "center"}}>
        <div className="mx-auto" style={{width: "100px"}}>
          <CircularProgressbar
            percentage={percentage}
            text={`${percentage}%`}
            strokeWidth={4}
            styles={{
              path: { stroke: color, strokeLinecap: 'butt' },
              text: { fill: color, fontSize: '30px' }
            }}
          />
        </div>
        <span style={{marginTop: "10px", fontWeight: "bold"}}>{this.props.type}</span>
      </div>)
      }
    }

function mapStateToProps(state) {
  return({});
}

const connectedPage = connect(mapStateToProps)(Progressbar);
export { connectedPage as Progressbar };
