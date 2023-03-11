import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function IcoStepThird(props) {
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className='text-center mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                SUBSCRIPTION CREATED
                </h1>
                <p className='text-base'>
                    <Link className="photo_cap_btn" to="/dashboard/assets">REVIEW NOW !</Link>
                </p>
            </div>
        </div>
    );
}
export default IcoStepThird;