import React from 'react';
import { connect } from 'react-redux';

import ReactDataGrid from "react-data-grid";
import moment from 'moment';

class Data extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let gridHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 90;
    let { data } = this.props;

    const ValueFormatter = ({value}) => {
      return <span style={{ color: value['valid'] ? "green" : "red"}}>{value.value}</span>
    };

    let col = [{ key: "id", name: "Time", frozen: true, width: 185 }];
    let row = [];

    if (data){
      let items = data[0].Data.map(x=>x.DisplayName);

      for (let itemNo in items){
        let new_col = {key: itemNo, name: items[itemNo], resizable: true, dragable: true};
        new_col['formatter'] = ValueFormatter;
        col.push(new_col);
      }
    }

    for (let time in data){
      let new_row = {id: moment(data[time].TimeStamp).format('MMMM Do YYYY, H:mm')};
      for (let device in data[time].Data){
          let device_id = device;
          let value = data[time].Data[device].Value ? data[time].Data[device].Value.toFixed(2) : "N/A";
          let unit = data[time].Data[device].Unit ? data[time].Data[device].Unit : "";
          let valid = data[time].Data[device].Valid ? data[time].Data[device].Valid : true;
          new_row[device_id] = {
            value: value+ unit,
            valid: valid
          };
      }
      row.unshift(new_row);
    }

    return (
      <div style={{height: '100vh !important'}}>
        <ReactDataGrid
          columns={col}
          rowGetter={i => row[i]}
          rowsCount={row.length}
          minHeight={gridHeight}/>
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
