import React from 'react';
import loader from '../Images/flask.gif';

const Loader = () => {
    return (
        <div className="mt-5 text-center">
            <h2>Loading...</h2>
            <img src={loader} />
        </div>
    );
}

export default Loader;