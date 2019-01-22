import React from 'react';
import ReactDOM from 'react-dom';
import { Samy, SvgProxy } from 'react-samy-svg';
import svgcontents from 'raw-loader!../../svg/HeatExchanger.svg';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class Hx extends React.Component {
  constructor(props){
    super(props);
    this.state={
      Settings: {
        ShellInlet: "23.5",
        ShellOutlet: "12.5",
        TubeInlet: "12.5",
        TubeOutlet: "33.5"
      }
    }
    this.HandleText = this.HandleText.bind(this);
    this.OpenHxDetail = this.OpenHxDetail.bind(this);
  }

  HandleText(elem){
    const { Settings } = this.state;
    elem.innerHTML = Settings[elem.id];
  }

  OpenHxDetail(){
    console.log(123);
  }

  render(){
    return(
      <div className="col NonDraggableAreaPlot">
        <Samy svgXML={svgcontents} >
          {Object.keys(this.state.Settings).map((item,i) =>
            // <SvgProxy selector={"#" + item} key={i} onElementSelected={(elem) => this.HandleText(elem)} onClick={(e) => this.HandleModalClick(e)}/>
            <SvgProxy selector={"#" + item} key={i} onElementSelected={(elem) => this.HandleText(elem)}/>
          )}
        </Samy>
      </div>);
  }
}


export default Hx;
