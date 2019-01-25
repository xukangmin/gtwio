import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

const SingleDevice = (props) => {
  return(
    <tr>
      <th scope="row">{props.data.SerialNumber}</th>
      <td>{props.data.Data[0].Value}</td>
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
                <th>Temperature</th>
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
