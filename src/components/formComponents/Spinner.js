import React from 'react';
import Loader from 'react-loader-spinner';

import 'react-loader-spinner/dist/loader/css/CradleLoader.css';
import 'react-loader-spinner/dist/loader/css/Plane.css';
import 'react-loader-spinner/dist/loader/css/Triangle.css';

const Spinner = () => {
    return (
        <Loader
            className='spinner'
            type="TailSpin"
            color="#FFFFFF"
            height={18}
            width={18}
        />
    );
};

export default Spinner;
