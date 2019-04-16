import React from 'react';
import { connect } from 'react-redux';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { item } = this.props;
    
    return(
      <div className="mb-1" style={{display: "flex", alignItems: "center"}}>
        <h5>{item.Name}</h5>
        <span>{item.Value.toFixed(2)}{item.Unit}</span>
      </div>
      
    )
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(ProgressBar);
export { connectedPage as ProgressBar };
