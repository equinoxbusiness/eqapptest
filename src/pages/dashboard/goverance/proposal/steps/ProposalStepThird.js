import React from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { getOrg } from '../../../../../services/dashboard';

function ProposalStepThird(props) {
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className='text-center mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    PROPOSAL PUBLISHED
                </h1>
                <div className="fw-bold mb-3">Sent for Internal Voting</div>
            </div>
        </div>
    );
}

export default connect()(ProposalStepThird);