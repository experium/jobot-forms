import React from 'react';
import Loader from 'react-loader-spinner';

// import 'react-loader-spinner/dist/loader/css/style.css';

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
