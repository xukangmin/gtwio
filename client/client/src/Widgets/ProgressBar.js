import React from 'react';
import { connect } from 'react-redux';
import { Progress } from 'antd';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { type, percentage, unit } = this.props;
    
    return(
      <div className="mb-1">
        <span>{type}</span>
        <Progress percent={percentage} status="active" />
      </div>
      
    )
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedPage = connect(mapStateToProps)(ProgressBar);
export { connectedPage as ProgressBar };
