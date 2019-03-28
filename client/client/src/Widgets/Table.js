import React from 'react';
import { connect } from 'react-redux';

const SingleItem = (props) => {
  return(
    <tr>
      <th scope = "row"><a href = {"/asset/" + props.asset + "/device/" + props.data.DeviceID}>{props.data.DisplayName}</a></th>
      <td>{props.data.Parameters[0].CurrentValue.toFixed(2) + props.unit}</td>
      <td>{props.data.Parameters[0].DataStatistics.Min.toFixed(2) + props.unit}</td>
      <td>{props.data.Parameters[0].DataStatistics.Max.toFixed(2) + props.unit}</td>
      <td>{props.data.Parameters[0].DataStatistics.Avg.toFixed(2) + props.unit}</td>
      <td>{props.data.Parameters[0].DataStatistics.STDEV.toFixed(2) + props.unit}</td>
    </tr>)
}

class Table extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { data, asset, unit } = this.props;

    return(
      <div className = "table-responsive">
        <table className = "table table-striped mt-3" style={{textAlign: "center"}}>
          <thead>
            <tr>
              <th>Device</th>
              <th>Current</th>
              <th>Min</th>
              <th>Max</th>
              <th>Mean</th>
              <th>STDEV</th>
            </tr>
          </thead>
          <tbody>
            {data.map((single,i) =>
              <SingleItem data = {single} unit={unit} asset={asset} key = {i}/>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}


function mapStateToProps(state) {
}

const connectedPage = connect(mapStateToProps)(Table);
export { connectedPage as Table };
