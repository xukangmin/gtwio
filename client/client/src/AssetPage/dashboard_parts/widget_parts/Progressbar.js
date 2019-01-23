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
      <div style={{maxWidth: "150px", marginRight: "10px"}}>
        <CircularProgressbar
          percentage={percentage}
          text={`${percentage}%`}
        />
      </div>)
      }
    }

function mapStateToProps(state) {
  return({});
}

const connectedPage = connect(mapStateToProps)(Progressbar);
export { connectedPage as Progressbar };
