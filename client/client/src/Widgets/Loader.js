import React from 'react';
import { Spin, Alert } from 'antd';

const Loader = () => {
    return (
        <Spin tip="Loading Data...">
            <Alert
                message=""
                description=""
                type="info"
                style={{minHeight: "200px"}}
            />
        </Spin>
    );
}

export default Loader;