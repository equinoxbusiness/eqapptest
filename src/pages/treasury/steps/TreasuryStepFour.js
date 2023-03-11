import React from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

function TreasuryStepFour(props) {
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className='text-center mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    DAO DEPLOYED !
                </h1>
                <p className='text-base'>
                    <Link className="photo_cap_btn" to="/dashboard">ACCESS DASHBOARD</Link>
                </p>
            </div>
        </div>
    );
}

export default connect()(TreasuryStepFour);