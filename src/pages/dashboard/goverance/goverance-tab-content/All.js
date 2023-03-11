import React from 'react';
import rejectIcon from "../../../../assets/images/rejected.png";
import progressIcon from "../../../../assets/images/progress.png";
import checkedImage from "../../../../assets/images/checked.png";
import { connect } from 'react-redux';
import { Tag } from 'antd';

function All(props) {
    const { org } = props;
    return (
        <div>
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-md:grid-cols-2 gap-6 max-lg:text-center">
                {org?.proposal?.length &&
                    org.proposal.map((pro, index) => {
                        return (
                            <div className='welcome-card rounded-lg p-6 mb-3 text-black' key={index}>
                                <div className=''>
                                    <div className='mb-3'>
                                        {pro.description}
                                    </div>
                                    <Tag color="processing" className='pt-2 pb-0 px-3 '>
                                        <div className='self-center flex gap-2'>
                                            <img
                                                src={
                                                    pro.status === "Initialized" ||
                                                        pro.status === "Expired"
                                                        ? progressIcon
                                                        : pro.status === "Approved"
                                                            ? checkedImage
                                                            : rejectIcon
                                                }
                                                className="w-5 mb-2"
                                                alt=""
                                            />
                                            <p>
                                                {pro.status === "Initialized" ||
                                                    pro.status === "Expired"
                                                    ? "In Progress"
                                                    : pro.status === "Approved"
                                                        ? "Completed"
                                                        : "Rejected"}
                                            </p>
                                        </div>
                                    </Tag>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        org: state.org,
        auth: state.auth,
    };
};

export default connect(mapStateToProps)(All);