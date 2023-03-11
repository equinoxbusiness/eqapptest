import React from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

function ProjectStepSix(props) {
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className='text-center mb-12'>
                <p>PROJECT LAUNCHER</p>
                <h1 className='text-2xl font-bold mb-4'>
                    PROJECT DEPLOYED !
                </h1>
                <p className='text-base'>
                    <Link className="photo_cap_btn" to="/dashboard/project">MANAGE NOW !</Link>
                </p>
            </div>
        </div>
    );
}

export default connect()(ProjectStepSix);