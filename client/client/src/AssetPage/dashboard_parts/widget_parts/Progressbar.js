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
    return(
      <div style={{maxWidth: "200px", marginRight: "50px", textAlign: "center"}}>
        <CircularProgressbar
          percentage={percentage}
          text={`${percentage}%`}
        />
        <h5>Heat Transfer Rate</h5>
      </div>)
      }
    }

function mapStateToProps(state) {
  return({});
}

const connectedPage = connect(mapStateToProps)(Progressbar);
export { connectedPage as Progressbar };
