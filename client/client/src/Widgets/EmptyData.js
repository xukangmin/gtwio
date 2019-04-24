import React from 'react';
import { Empty, Button } from 'antd';

const EmptyData = () => {
    return (
        <div>
            <hr/>
            <Empty
                image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                imageStyle={{
                height: 60,
                }}
                style={{paddingTop: "10%"}}
                description={
                <span>
                    No data during the selected time range
                </span>
                }
            >
            <Button onClick={e=>document.getElementById('timePicker').click()} type="primary">Select a new time range</Button>
            </Empty>
        </div>
    );
}

export default EmptyData;

