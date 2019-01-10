import React from 'react';

export default function TestSVG(props) {
  return (
    <svg {...props}>
      <g id="layer1" transform="translate(-165.77517,-208.94297)">
        <rect style={{opacity: 1, fill: '#ffff00', fillOpacity: 1, fillRule: 'evenodd', stroke: '#333333', strokeWidth: '1.79999995', strokeLinecap: 'round', strokeLinejoin: 'miter', strokeMiterlimit: 4, strokeDasharray: '10.79999971, 10.79999971', strokeDashoffset: 0, strokeOpacity: 1}} id="rect4136" width="81.822357" height="46.467018" x="166.67517" y="209.89499" />
        <text xmlSpace="preserve" style={{fontStyle: 'normal', fontWeight: 'normal', fontSize: 40, lineHeight: '125%', fontFamily: 'sans-serif', letterSpacing: 0, wordSpacing: 0, fill: '#000000', fillOpacity: 1, stroke: 'none', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeOpacity: 1}} x="191.51056" y="237.16908" id="Data1" >
          <tspan id="tspan4140" x="191.51056" y="237.16908" style={{fontSize: '17.5px'}}>{props.shellinlet}</tspan>
        </text>
        <rect style={{opacity: 1, fill: '#ffff00', fillOpacity: 1, fillRule: 'evenodd', stroke: '#333333', strokeWidth: '1.79999995', strokeLinecap: 'round', strokeLinejoin: 'miter', strokeMiterlimit: 4, strokeDasharray: '10.79999971, 10.79999971', strokeDashoffset: 0, strokeOpacity: 1}} id="rect4136-4" width="81.822357" height="46.467018" x="264.44598" y="209.84297" />
        <text xmlSpace="preserve" style={{fontStyle: 'normal', fontWeight: 'normal', fontSize: 40, lineHeight: '125%', fontFamily: 'sans-serif', letterSpacing: 0, wordSpacing: 0, fill: '#000000', fillOpacity: 1, stroke: 'none', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeOpacity: 1}} x="290.70993" y="237.11708" id="Data2" >
          <tspan id="tspan4140-1" x="290.70993" y="237.11708" style={{fontSize: '17.5px'}}>{props.shelloutlet}</tspan>
        </text>
      </g>
    </svg>
  );
}
