import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

const SingleDevice = (props) => {
  return(
    <tr>
      <th scope = "row"><a href = {"/asset/" + props.asset + "/device/" + props.data.DeviceID}>{props.data.SerialNumber}</a></th>
      <td>{props.data.Data[0].Value.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Min.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Max.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Avg.toFixed(2)}</td>
      <td>{props.data.DataStatistics.STDEV.toFixed(2)}</td>
    </tr>)
}

class TagTable extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const { DeviceData } = this.props;
    return(
      <div className = "table-responsive">
          <table className = "table table-striped" style={{textAlign: "center"}}>
            <thead>
              <tr>
                <th>Device</th>
                <th>Current</th>
                <th>Min</th>
                <th>Max</th>
                <th>Average</th>
                <th>STDEV</th>
              </tr>
            </thead>
            <tbody>
              {DeviceData.map((singleDevice,i) =>
                  <SingleDevice data = {singleDevice} asset = {this.props.asset} key = {i}/>
              )}
            </tbody>
          </table>
        </div>
    );
  }
}


function mapStateToProps(state) {
  const { data } = state.data;
  return {
      DeviceData: data
  };
}

const connectedPage = connect(mapStateToProps)(TagTable);
export { connectedPage as TagTable };
