import React from 'react';
import { Spin, Alert } from 'antd';

const Loader = () => {
    return (
        <div style={{width: "100%"}}>
            <Spin tip="Loading Data...">
                <Alert
                    message=""
                    description=""
                    type="info"
                    style={{minHeight: "200px"}}
                />
            </Spin>
        </div>
        
    );
}

export default Loader;