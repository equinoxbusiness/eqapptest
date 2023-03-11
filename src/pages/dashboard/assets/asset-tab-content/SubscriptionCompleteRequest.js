import React from 'react';
import { connect } from 'react-redux';

function SubscriptionCompleteRequest(props) {
    const { org } = props;
    return (
        <div>
            {org &&
                org?.ico.length > 0 &&
                org?.ico
                    .filter((val) => val.finalized === 1)
                    .map((pro) => {
                        return (
                            <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={pro.id}>
                                <div className='flex gap-6 justify-between'>
                                    <div>
                                        ICO Address: {pro.ico_address}
                                    </div>
                                    <div className='self-center'>
                                        Supply: {pro.supply}
                                    </div>
                                </div>
                            </div>
                        )
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
  
  export default connect(mapStateToProps)(SubscriptionCompleteRequest);