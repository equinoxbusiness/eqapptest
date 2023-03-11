import React from 'react';
import { connect } from 'react-redux';

function AddMemberFailed(props) {
    const { org } = props;
    return (
        <div>
            {org &&
            org.members &&
            org.members.length > 0 &&
            org.members
            .filter((val) => val.is_active === -1)
            .map((pro, index) => {
                return (
                    <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={pro.id}>
                        <div className='flex gap-6 justify-between'>
                            <div>
                                Name: {pro.member_name}
                            </div>
                            <div>
                                Wallet Address: {pro.wallet_address}
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
      auth: state.auth,
    };
};
  
export default connect(mapStateToProps)(AddMemberFailed);