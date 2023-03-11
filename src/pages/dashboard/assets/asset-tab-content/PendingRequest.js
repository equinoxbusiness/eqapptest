import { Button } from 'antd';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import ConfirmModal from "../../../../components/modals/ConfirmModal";
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import multiSigv2Abi from "./../../../../Config/abis/EquinoxMain.json";
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux/actions";
import DetailModal from '../../../../components/DetailModal';

function PendingRequest(props) {
    const { org, auth } = props;
    const [currentValues, setCurrentValues] = useState({});
    const [transferApproveModal, setTransferApproveModal] = useState(false);
    const [transferDissApproveModal, setTransferDissApproveModal] = useState(false);
    const [transferFinalizeModal, setTransferFinalizeModal] = useState(false);
    const [view, setView] = useState(false);
    const [voters, setVoter] = useState([]);
    const [votingLoading, setVotingLoading] = useState(false);
    const [message, setMessage] = useState("Vote has been registered");
    const [errPopup, setErrPopup] = useState(false);
    const [action, setAction] = useState(false);
    const [proposals, setProposals] = useState([]);
    const getVotingList = async (pro, type) => {
        if (org && org?.members?.length > 0) {
          setVotingLoading(true);
    
          setVoter([]);
          org.members
            .filter((member) => member.is_active === 1)
            .forEach(async (element) => {
              let objectOfMember = {};
              axios
                .get(
                  `${process.env.REACT_APP_API_URL}/get_vote_list_by_type/${type}/${element.id}`
                )
                .then(({ data }) => {
                  console.log(data, pro);
                  if (data.status === "success") {
                    const matchedVales = data.response.filter(
                      (item) => item.proposal_id === pro?.id
                    );
                    console.log("Matched", matchedVales);
                    objectOfMember = element;
                    if (matchedVales.length > 0) {
                      objectOfMember.voted = "Yes";
                    } else {
                      objectOfMember.voted = "No";
                    }
                  }
                  if (data.status === "error") {
                    objectOfMember = element;
                    objectOfMember.voted = "No";
                  }
    
                  setVoter((prev) => [...prev, objectOfMember]);
                  setVotingLoading(false);
                })
                .catch((error) => {
                  setVotingLoading(false);
                  console.log(error);
                  // setLoading(false);
                });
            });
          console.log("calling");
          // setLoading(false);
          setView(true);
        }
    };
    const getProposals = async () => {
        let web3 = await getWeb3();
        let multiSigAddr = org?.org?.multisig_address;
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const returnvalue = await contract.methods.listProposals().call();
        // console.log("LIST OF PROPOSALS", returnvalue);
        setProposals(returnvalue);
    };
    const transferApproveHandler = (values) => {
        console.log(values);
        setTransferApproveModal(false);
        approve(values.to_wallet, values.id);
    };
    
    const transferDissApproveHandler = (values) => {
        console.log(values);
        setTransferDissApproveModal(false);
        disApprove(values.to_wallet, values.id);
    };
    const transferFinalizeHandler = (values) => {
        console.log(values);
        setTransferFinalizeModal(false);
        finalize(values.to_wallet, values.tokenAddress, values.id);
    };
    const approve = async (to, id) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const {
          data: { response: indexListOftransferProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "transfer_proposal",
        });
        console.log(indexListOftransferProposal);
    
        const propIndex =
          indexListOftransferProposal?.filter(
            (val) => Number(val.data) === id
          )[0].index_number - 1;
        console.log(propIndex);
    
        const isSigned = await contract.methods
          .isTransferProposalSigned(propIndex, account)
          .call();
        console.log(isSigned);
        const isDisapprovedSigned = await contract.methods
          .isTransferProposalDisapproved(propIndex, account)
          .call();
        if (isDisapprovedSigned) {
          alert("Proposal has been disapproved by one of the team member");
        } else {
          if (!isSigned) {
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .signTransferProposal(propIndex)
              .send({ from: account })
              .on("error", (error) => {
                console.log(error);
                store.dispatch(updateSpinner(false));
              })
              .then(async (result) => {
                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL}/add_vote`,
                  {
                    member_id: auth.id,
                    org_id: org?.org?.id,
                    proposal_id: id,
                    proposal_type: 4,
                    vote: 1,
                  }
                );
                console.log("Vote Done", response);
    
                console.log(result);
                store.dispatch(updateSpinner(false));
                setMessage("Your Vote has been registered");
                setAction(true);
                setTimeout(() => {
                  setAction(false);
                }, 500);
              });
          } else {
            alert("Vote has already been registered");
          }
        }
      };
      const disApprove = async (to, id) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const {
          data: { response: indexListOftransferProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "transfer_proposal",
        });
        console.log(indexListOftransferProposal);
    
        const propIndex =
          indexListOftransferProposal?.filter(
            (val) => Number(val.data) === id
          )[0].index_number - 1;
    
        console.log(propIndex);
        const isAprroved = await contract.methods
          .isTransferProposalSigned(propIndex, account)
          .call();
        const isSigned = await contract.methods
          .isTransferProposalDisapproved(propIndex, account)
          .call();
        console.log(isSigned);
        if (isAprroved) {
          alert("Your vote already registered");
        } else {
          if (!isSigned) {
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .disapproveTransferProposal(propIndex)
              .send({ from: account })
              .on("error", (error) => {
                console.log(error);
                store.dispatch(updateSpinner(false));
              })
              .then(async (result) => {
                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL}/add_vote`,
                  {
                    member_id: auth.id,
                    org_id: org?.org?.id,
                    proposal_id: id,
                    proposal_type: 4,
                    vote: 0,
                  }
                );
                console.log("Vote Done", response);
                console.log(result);
                store.dispatch(updateSpinner(false));
                setMessage("Your Vote has been registered");
                setAction(true);
                setTimeout(() => {
                  setAction(false);
                }, 500);
              });
          } else {
            alert("Proposal has been disapproved");
          }
        }
      };
    
      const finalize = async (to, tokenAddress, id) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const {
          data: { response: indexListOftransferProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "transfer_proposal",
        });
        console.log(indexListOftransferProposal);
    
        const propIndex =
          indexListOftransferProposal?.filter(
            (val) => Number(val.data) === id
          )[0].index_number - 1;
        console.log(propIndex);
        const isFullySigned = await contract.methods
          .transferProposalSignerRequirementMet(propIndex)
          .call();
        console.log(isFullySigned);
        const isDisapprovedSigned = await contract.methods
          .isTransferProposalDisapproved(propIndex, account)
          .call();
        if (isDisapprovedSigned) {
          alert("Proposal has been disapproved");
        } else {
          if (isFullySigned) {
            console.log(to);
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .finalizeTransferProposal(propIndex)
              .send({ from: account })
              .on("error", (error) => {
                store.dispatch(updateSpinner(false));
                console.log(error);
                setErrPopup(true);
              })
              .then((result) => {
                console.log(result);
                axios
                  .post(`${process.env.REACT_APP_API_URL}/finalize_fund_transfer`, {
                    id: id,
                    status: 1,
                  })
                  .then((res) => {
                    console.log(res);
                    store.dispatch(updateSpinner(false));
                    setMessage("Proposal Finalize successfully");
                    setAction(true);
                    setTimeout(() => {
                      setAction(false);
                      window.location.reload();
                    }, 500);
                  });
                getProposals();
              });
          } else {
            alert("All members have not approved this transaction");
          }
        }
      };
    return (
        <div>
            {org &&
                org.fund_transfer.length > 0 &&
                org.fund_transfer
                    .filter(
                        (val) => val.status !== 1 && val.status !== -1
                    )
                    .map((pro, index) => {
                    return (
                        <div className='welcome-card rounded-lg p-6 mb-6 text-black'>
                            <div className='flex gap-6 justify-between'>
                                <div>
                                    Receiver: {pro.to_wallet}
                                    <br />
                                    Descrription: {pro.description}
                                </div>
                                <div>
                                    Amount: {pro.amount} {org.project[0].token_name}
                                </div>
                                <div>
                                {!pro.finalized && (
                                    <span
                                    onClick={() => {
                                        setCurrentValues(pro);
                                        setTransferApproveModal(true);
                                    }}
                                    className="approve"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M5 12l5 5l10 -10"></path>
                                        </svg>
                                    </span>
                                )}
                                {pro.finalized && (
                                     <span
                                     // onClick={() => approve(index)}
                                     className="approved"
                                   >
                                     Approved
                                   </span>
                                )}
                                </div>
                                <div onClick={() => {
                                    setCurrentValues(pro);
                                    setTransferDissApproveModal(true);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M18 6l-12 12"></path>
                                        <path d="M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <div>
                                    3 Days
                                </div>
                                <div className='flex gap-3'>
                                {!pro.finalized && (<Button type='primary' className='grad-btn border-0' onClick={() => {
                                    setCurrentValues(pro);
                                    setTransferFinalizeModal(true);
                                  }}>Finalize</Button>)}
                                    <Button type='primary' className='grad-btn border-0' onClick={() => {
                                  setCurrentValues(pro);
                                  getVotingList(pro, 4);
                                }}>View</Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <ConfirmModal
                    title="Are you sure you want to Approve!"
                    // note=""
                    // note_bracket=""
                    open={transferApproveModal}
                    setOpen={setTransferApproveModal}
                    handler={transferApproveHandler}
                    currentValues={currentValues}
                />
                <ConfirmModal
                    title="Are you sure you want to Disapprove!"
                    // note=""
                    // note_bracket=""
                    open={transferDissApproveModal}
                    setOpen={setTransferDissApproveModal}
                    handler={transferDissApproveHandler}
                    currentValues={currentValues}
                />
                <ConfirmModal
                    title="Are you sure you want to Finalize!"
                    // note=""
                    // note_bracket=""
                    open={transferFinalizeModal}
                    setOpen={setTransferFinalizeModal}
                    handler={transferFinalizeHandler}
                    currentValues={currentValues}
                />
                <DetailModal
                  open={view}
                  setOpen={setView}
                  handleOpen={() => setView(true)}
                  handleClose={() => setView(false)}
                  voters={voters}
                  votingLoading={votingLoading}
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
  
  export default connect(mapStateToProps)(PendingRequest);