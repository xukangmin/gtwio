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
      return <span title={value.value} style={{ textAlign: "center", color: value['valid'] ? "green" : "red"}}>{value.value}</span>
    };

    const HeaderFormatter = (value) => {
      console.log(value)
      return <span title={value.column.name}>{value.column.name}</span>
    };

    let col = [{ key: "id", name: "Time", frozen: true, width: 155 }];    
    let row = [];

    if (data){
      let cols = data.AssetColumnInfo;
      for (let itemNo in cols){
        let new_col = {key: itemNo, name: cols[itemNo].Header, resizable: true, dragable: true, width: 65};
        new_col['formatter'] = ValueFormatter;
        new_col['headerRenderer'] = HeaderFormatter;
        col.push(new_col);
      }
    }

    if(data){
      let rows = data.AssetData;
      for (let time in rows){
        let new_row = {id: moment(rows[time].TimeStamp).format('MMMM Do YYYY, H:mm')};
        for (let device in rows[time].Data){
          let value = rows[time].Data[device].Value ? rows[time].Data[device].Value.toFixed(2) : 'N/A';
          let valid = rows[time].Data[device].Valid;
          let unit = data.AssetColumnInfo[device].Unit ? data.AssetColumnInfo[device].Unit : " ";
          new_row[device] = {
            value: value + unit,
            valid: valid
          };
        } 
      row.unshift(new_row);
      }      
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
