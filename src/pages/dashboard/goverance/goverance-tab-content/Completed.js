import React from 'react';
import rejectIcon from "../../../../assets/images/rejected.png";
import progressIcon from "../../../../assets/images/progress.png";
import checkedImage from "../../../../assets/images/checked.png";
import { connect } from 'react-redux';

function Completed(props) {
    const { org } = props;
    return (
        <div>
             {org &&
                    org.proposal.length > 0 &&
                    org.proposal
                      .filter((pro) => pro.status === "Approved")
                      .map((pro, index) => {
                        return (
                        <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={index}>
                            <div className='flex gap-6 justify-between'>
                                <div>
                                    {pro.description}
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
      auth: state.auth,
    };
};
  
export default connect(mapStateToProps)(Completed);