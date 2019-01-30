import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

const SingleDevice = (props) => {
  return(
    <tr>
      <th scope="row"><a href={"/asset/ASSETID0/detail/"+props.data.DeviceID}>{props.data.SerialNumber}</a></th>
      <td>{props.data.Data[0].Value.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Min.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Max.toFixed(2)}</td>
      <td>{props.data.DataStatistics.Avg.toFixed(2)}</td>
      <td>{props.data.DataStatistics.STDEV.toFixed(2)}</td>
    </tr>)
}

class TempTable extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="table-responsive">
          <table className="table table-striped" style={{textAlign:'center'}}>
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
              {this.props.data.map((singleDevice,i) =>
                  <SingleDevice data={singleDevice} key={i}/>
              )}
            </tbody>
          </table>
        </div>
    );
  }
}


function mapStateToProps(state) {
  // const { data } = state.dashboard;
  return {

  };
}

const connectedPage = connect(mapStateToProps)(TempTable);
export { connectedPage as TempTable };
