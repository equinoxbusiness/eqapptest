import React, { useState } from 'react';
import { connect } from 'react-redux';
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import multiSigv2Abi from "./../../../../Config/abis/EquinoxMain.json";
import axios from "axios";
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux/actions";
import ConfirmModal from "../../../../components/modals/ConfirmModal";
import { Button } from 'antd';
import DetailModal from '../../../../components/DetailModal';

function SubscriptionPendingRequest(props) {
    const { auth, org } = props;
    const [currentValues, setCurrentValues] = useState({});
    const [icoApproveModal, setIcoApproveModal] = useState(false);
    const [message, setMessage] = useState("Vote has been registered");
    const [action, setAction] = useState(false);
    const [errPopup, setErrPopup] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [icoDissApproveModal, setIcoDissApproveModal] = useState(false);
    const [icoFinalizeModal, setIcoFinalizeModal] = useState(false);
    const [view, setView] = useState(false);
    const [voters, setVoter] = useState([]);
    const [votingLoading, setVotingLoading] = useState(false);

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

    const approveIco = async (values) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
    
        const {
          data: { response: indexOfProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "ico_proposal",
        });
        const propIndex =
          (await indexOfProposal.filter(
            (val) => Number(val.data) === values.id
          )[0].index_number) - 1;
        console.log(propIndex);
    
        // return;
        // const propIndex = 0;
        const isSigned = await contract.methods.isSigned(propIndex, account).call();
        console.log(isSigned);
        const isDisapprovedSigned = await contract.methods
          .isProposalDisapproved(propIndex, account)
          .call();
        if (isDisapprovedSigned) {
          alert("Proposal has been disapproved by one of the team member");
        } else {
          if (!isSigned) {
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .sign(propIndex)
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
                    proposal_id: values.id,
                    proposal_type: 5,
                    vote: 1,
                  }
                );
                console.log("Vote Done", response);
                console.log(result);
                store.dispatch(updateSpinner(false));
                setMessage("Vote has been registered");
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
    
      const disApproveIco = async (values) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const {
          data: { response: indexOfProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "ico_proposal",
        });
        const propIndex =
          (await indexOfProposal.filter(
            (val) => Number(val.data) === values.id
          )[0].index_number) - 1;
        console.log(propIndex);
        const isAprroved = await contract.methods
          .isSigned(propIndex, account)
          .call();
        const isSigned = await contract.methods
          .isProposalDisapproved(propIndex, account)
          .call();
        console.log(isSigned);
        if (isAprroved) {
          alert("Your vote already registered");
        } else {
          if (!isSigned) {
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .disapproveProposal(propIndex)
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
                    proposal_id: values.id,
                    proposal_type: 5,
                    vote: 0,
                  }
                );
    
                axios
                  .post(`${process.env.REACT_APP_API_URL}/update_reached`, {
                    id: values.id,
                    status: 1,
                  })
                  .then((res) => {
                    console.log(res);
                    // store.dispatch(updateSpinner(false));
                  });
                console.log("Vote Done", response);
                console.log(result);
                store.dispatch(updateSpinner(false));
                setMessage("Vote has been registered");
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
    
      const finalizeIco = async (values) => {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const {
          data: { response: indexOfProposal },
        } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
          org_id: org?.org?.id,
          type: "ico_proposal",
        });
        const propIndex =
          (await indexOfProposal.filter(
            (val) => Number(val.data) === values.id
          )[0].index_number) - 1;
        console.log(propIndex);
        const isFullySigned = await contract.methods
          .signerRequirementMet(propIndex)
          .call();
        console.log(isFullySigned);
        const isDisapprovedSigned = await contract.methods
          .isProposalDisapproved(propIndex, account)
          .call();
        if (isDisapprovedSigned) {
          alert("Proposal has been disapproved");
        } else {
          if (isFullySigned) {
            // console.log(account, values);
            // return;
            store.dispatch(updateSpinner(true));
    
            await contract.methods
              .finalizeProposal(propIndex, values.ico_address)
              .send({ from: account })
              .on("error", (error) => {
                store.dispatch(updateSpinner(false));
                console.log(error);
                setErrPopup(true);
              })
              .then((result) => {
                console.log(result);
                axios
                  .get(
                    `${process.env.REACT_APP_API_URL}/finalize_ico/${values.ico_address}/1`
                  )
                  .then((res) => {
                    console.log(res);
                    store.dispatch(updateSpinner(false));
                    setMessage("Proposal Finalize successfully");
                    setAction(true);
                    setTimeout(() => {
                      setAction(false);
                    }, 500);
                  });
                getProposals();
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              });
          } else {
            alert("All members have not approved this transaction");
          }
        }
      };

    const icoApproveHandler = (values) => {
        console.log(values);
        setIcoApproveModal(false);
        approveIco(values);
    };
    const icoDissApproveHandler = (values) => {
        console.log(values);
        setIcoDissApproveModal(false);
        disApproveIco(values);
    };
    
    const icoFinalizeHandler = (values) => {
        console.log(values);
        setIcoFinalizeModal(false);
        finalizeIco(values);
    };
    return (
        <div>
            {org &&
                org?.ico.length > 0 &&
                org?.ico
                    .filter((val) => val.finalized !== 1)
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
                                    <div className='self-center'>
                                        <span
                                            onClick={() => {
                                                setCurrentValues(pro);
                                                setIcoApproveModal(true);
                                            }}
                                            className="approve"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M5 12l5 5l10 -10"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div className='self-center' onClick={() => {
                                        setCurrentValues(pro);
                                        setIcoDissApproveModal(true);
                                        }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                          <path d="M18 6l-12 12"></path>
                                          <path d="M6 6l12 12"></path>
                                      </svg>
                                    </div>
                                    <div className='flex gap-3'>
                                        {!pro.finalized && (
                                            <Button type='primary' className='grad-btn border-0' onClick={() => {
                                                setCurrentValues(pro);
                                                setIcoFinalizeModal(true);
                                              }}>Finalize</Button>
                                        )}
                                        <Button type='primary' className='grad-btn border-0'  onClick={() => {
                                            setCurrentValues(pro);
                                            getVotingList(pro, 5);
                                        }}>View</Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
                <ConfirmModal
                    title="Are you sure you want to Approve!"
                    // note=""
                    // note_bracket=""
                    open={icoApproveModal}
                    setOpen={setIcoApproveModal}
                    handler={icoApproveHandler}
                    currentValues={currentValues}
                />
                <ConfirmModal
                    title="Are you sure you want to DissApprove!"
                    // note=""
                    // note_bracket=""
                    open={icoDissApproveModal}
                    setOpen={setIcoDissApproveModal}
                    handler={icoDissApproveHandler}
                    currentValues={currentValues}
                />
                <ConfirmModal
                    title="Are you sure you want to Finalize!"
                    // note=""
                    // note_bracket=""
                    open={icoFinalizeModal}
                    setOpen={setIcoFinalizeModal}
                    handler={icoFinalizeHandler}
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
  
  export default connect(mapStateToProps)(SubscriptionPendingRequest);