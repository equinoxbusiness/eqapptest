import React from 'react';
import { connect } from 'react-redux';

function FailedRequest(props) {
    const { org } = props;
    return (
        <div>
            {org &&
            org.fund_transfer.length > 0 &&
            org.fund_transfer
                .filter((val) => Number(val.status) === -1)
                .map((pro, index) => {
                    return (
                        <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={index}>
                            <div className='flex gap-6 justify-between'>
                                <div>
                                    Receiver: {pro.to_wallet}
                                    <br />
                                    Descrription: {pro.description}
                                </div>
                                <div className='self-center'>
                                    Amount: {pro.amount} {org.project[0].token_name}
                                </div>
                                
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
      org: state.org,
    };
  };
  
  export default connect(mapStateToProps)(FailedRequest);