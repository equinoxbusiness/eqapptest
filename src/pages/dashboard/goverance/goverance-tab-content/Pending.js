import React, { useEffect, useState }  from 'react';
import { connect } from 'react-redux';
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux//actions";
import ConfirmModal from "../../../../components/modals/ConfirmModal";
import axios from "axios";
import { message } from 'antd';
import { getOrg } from "../../../../services/dashboard";


function Pending(props) {
    const { org, auth } = props;
    const [rejectModal, setRejectModal] = useState(false);
    const [currentValues, setCurrentValues] = useState({});
    const [completeModal, setCompleteModal] = useState(false);
    const [errMessage, setErrMessage] = useState("Your vote has been registered");
    const [msgPopup, setMsgPopup] = useState(false);
    const rejectHandler = (values) => {
        setRejectModal(false);
        rejectProposal(values.id);
    };
    const completeHandler = (values) => {
        setCompleteModal(false);
        completeProposal(values.id);
    };
    const rejectProposal = async (id) => {
        store.dispatch(updateSpinner(true));
        axios
          .post(`${process.env.REACT_APP_API_URL}/finalize_proposal`, {
            id: id,
            status: "Rejected",
          })
          .then((res) => {
            console.log(res.data.status);
            if (res.data.status === "error") {
              message.error(res.data.message);
            } else {
              message.success(res.data.message);
            }
            store.dispatch(updateSpinner(false));
            setErrMessage("Proposal Rejected successfully");
            setMsgPopup(true);
            setTimeout(() => {
              setMsgPopup(false);
            }, 500);
            if (auth && auth.org_id) getOrg(auth.org_id);
          })
          .catch((err) => {
            console.log(err);
            store.dispatch(updateSpinner(false));
          });
      };
      const completeProposal = async (id) => {
        store.dispatch(updateSpinner(true));
        axios
          .post(`${process.env.REACT_APP_API_URL}/finalize_proposal`, {
            id: id,
            status: "Approved",
          })
          .then((res) => {
            console.log(res.data.status);
    
            store.dispatch(updateSpinner(false));
            setErrMessage("Proposal Completed successfully");
            setMsgPopup(true);
            setTimeout(() => {
              setMsgPopup(false);
            }, 500);
            if (auth && auth.org_id) getOrg(auth.org_id);
          });
      };
    return (
        <div>
            {org &&
                org.proposal.length > 0 &&
                org.proposal
                    .filter((pro) => pro.status === "Expired")
                    .map((pro, index) => {
                        return (
                        <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={index}>
                            <div className='flex gap-6 justify-between'>
                                <div>
                                    {pro.description}
                                </div>
                                <div className='self-center'>
                                    {
                                        <span
                                        onClick={() => rejectProposal(pro.id)}
                                        className="approve"
                                        >
                                        Reject
                                        </span>
                                    }
                                </div>
                                <div className='self-center'>
                                    {
                                        <button
                                        className="btn btn-primary finalize-btn"
                                        onClick={() => completeProposal(pro.id)}
                                        >
                                        Complete
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    );
                })
            }
            <ConfirmModal
                title="Are you sure you want to Reject!"
                // note=""
                // note_bracket=""
                open={rejectModal}
                setOpen={setRejectModal}
                handler={rejectHandler}
                currentValues={currentValues}
            />
            <ConfirmModal
                title="Are you sure you want to Complete!"
                // note=""
                // note_bracket=""
                open={completeModal}
                setOpen={setCompleteModal}
                handler={completeHandler}
                currentValues={currentValues}
            />
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
      org: state.org,
      auth: state.auth,
    };
};
  
export default connect(mapStateToProps)(Pending);