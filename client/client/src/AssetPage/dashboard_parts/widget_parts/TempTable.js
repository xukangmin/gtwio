import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

class TempTable extends React.Component {
  constructor(props){
    super(props);
    this.state={

    }
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
              <tr>
                <th scope="row">1</th>
                <td>95</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>85</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>75</td>
              </tr>
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
