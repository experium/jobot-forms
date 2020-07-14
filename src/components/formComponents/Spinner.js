import React from 'react';
import Loader from 'react-loader-spinner';

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
