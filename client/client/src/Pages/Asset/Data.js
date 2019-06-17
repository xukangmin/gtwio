import React from 'react';
import { connect } from 'react-redux';
import Loader from '../../Widgets/Loader';

import moment from 'moment';

class Data extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props;

    let bodyFormat = {
      overflowX: "auto"
    };
    
    let tableFormat = {
      textAlign: "center"
    };

    let tableHeaderFormat = { 
      overflow: "hidden", 
      lineHeight: "0.9", 
      fontWeight: "normal", 
      fontSize: "0.8em",
      backgroundColor: "#f6f6f6"
    };

    let unitFormat = {
      fontSize: "0.8em"
    };

    return (
      <div style={bodyFormat}>
        {data ?
          <table style={tableFormat} border="1" cellPadding="5" bordercolor="#d3d3d3">
            <tbody>
              <tr>
                <th></th>
                {data.AssetColumnInfo.map((x, i) => 
                  <th key={i} title={x.Header} style={tableHeaderFormat}>
                    {x.Header.split(/[ .:_]+/).join("\n")}
                  </th>)}
              </tr>

              {data.AssetData.map((t, idx) =>
                <tr key={idx}>
                  <td style={{...tableHeaderFormat, whiteSpace: "nowrap"}}>{moment(new Date(t.TimeStamp)).format('MMMM Do, H:mm')}</td>
                  {t.Data.map((x, i) => 
                    <td style={{ whiteSpace: "nowrap", color: x.Valid ? "green" : "red" }} key={i}>
                      {x.Value.toFixed(2)}<span style={unitFormat}>{data.AssetColumnInfo[i] ? data.AssetColumnInfo[i].Unit.replace("N/A", ""):""}</span>
                    </td>)}
                </tr>
              )}
            </tbody>
          </table>
        :
        <Loader />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.data;
  return {
    data: data
  };
}

const connectedPage = connect(mapStateToProps)(Data);
export { connectedPage as Data };
