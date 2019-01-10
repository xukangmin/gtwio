import React from 'react';

const LoginInfo = (props) => {
  return (
      <div className="alert alert-success" role="alert">
        {props.message}
      </div>
  ); 
};

export default LoginInfo;