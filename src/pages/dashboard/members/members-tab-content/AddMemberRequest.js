import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import ConfirmModal from '../../../../components/modals/ConfirmModal';
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux/actions";
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import multiSigv2Abi from "./../../../../Config/abis/EquinoxMain.json";
import { CommonModal } from "../../../../components/modals";
import { getMemberVotedList, getOrg } from "../../../../services/dashboard";
import DetailModal from "../../../../components/DetailModal";

function AddMemberRequest(props) {
    const { org, auth } = props;
    const [currentValues, setCurrentValues] = useState({});
    const [approveModal, setApproveModal] = useState(false);
    const [dissApproveModal, setDissApproveModal] = useState(false);
    const [finalizeModal, setFinalizeModal] = useState(false);
    const [voters, setVoter] = useState([]);
    const [view, setView] = useState(false);
    const [votingLoading, setVotingLoading] = useState(false);
    const [message, setMessage] = useState("Member has been removed");
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (org, auth) {
            getMemberVotedList(auth.id);
        }
    }, [org, auth]);
    useEffect(() => {
        //ADD MEMBER DISSAPPROVED CHECK
        const checkIfDissapproved = async () => {
          if (org && org.members.length > 0) {
            let web3 = await getWeb3();
            let accounts = await web3.eth.getAccounts();
            let account = accounts[0];
            let multiSigAddr = org?.org?.multisig_address;
            const contract = await new web3.eth.Contract(
              multiSigv2Abi.abi,
              multiSigAddr
            );
    
            org &&
              org.members &&
              org.members.length &&
              org.members
                .filter((val) => val.is_active === 0)
                .forEach(async (element) => {
                  console.log(element);
    
                  const {
                    data: { response: indexListOftransferProposal },
                  } = await axios.post(
                    `${process.env.REACT_APP_API_URL}/get_index_list`,
                    {
                      org_id: org?.org?.id,
                      type: "add_member",
                    }
                  );
                  console.log(indexListOftransferProposal, element.wallet_address);
    
                  const currentIndex =
                    indexListOftransferProposal?.filter(
                      (val) =>
                        val.data.toLowerCase() ===
                        element.wallet_address.toLowerCase()
                    )[0].index_number - 1;
                  if (contract) {
                    const resFromBlock = await contract.methods
                      .isFinalAddmemberProposal(currentIndex)
                      .call();
                    console.log(currentIndex, resFromBlock);
                    if (resFromBlock === false) {
                      // if (false) {
                      axios
                        .get(
                          `${process.env.REACT_APP_API_URL}/approve_member/${element.wallet_address}/-1`
                        )
                        .then((res) => {
                          console.log(res.data.status);
                          if (res.data.status === "error") {
                            console.log(res.data.status);
                          }
    
                          if (auth && auth.org_id) getOrg(auth.org_id);
                        });
                    }
                  }
                });
          }
        };
        checkIfDissapproved();
    }, [auth, org]);
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
    //ADD MEMBER _FUNCTIONS
    const approve = async (id, to) => {
        store.dispatch(updateSpinner(true));
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
            type: "add_member",
        });
        console.log(indexListOftransferProposal, '----', to);

        const propIndex =
            indexListOftransferProposal?.filter(
                (val) => val.data.toLowerCase() === to.toLowerCase()
            )[0].index_number - 1;

        // const propIndex = Number(org?.org?.add_member_index) - 1;
        console.log("INdex", propIndex);
        console.log("approving", id, auth?.id);
        const isNotAbleTosign = await contract.methods
            .hasAddMemberProposolSigned(propIndex, account)
            .call();

        console.log(isNotAbleTosign);
        const isSigned = await contract.methods
            .isAddMemberProposalDisapproved(propIndex, account)
            .call();
        console.log(isSigned, '-------isSigned------');
        if (isSigned) {
            store.dispatch(updateSpinner(false));
            alert("Member is Disapproved");
        } else {
            if (!isNotAbleTosign) {
                store.dispatch(updateSpinner(true));

                await contract.methods
                    .signAddMemberProposal(propIndex)
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
                                proposal_type: 2,
                                vote: 1,
                            }
                        );
                        console.log("Vote Done", response);
                        // const formData: any = new FormData();
                        // formData.append("member_id", id);
                        // formData.append("voter_id", auth?.id);
                        // formData.append("vote", 1);
                        // axios
                        //   .post(`${process.env.REACT_APP_API_URL}/member_vote`, formData)
                        //   .then((res) => {
                        //     store.dispatch(updateSpinner(false));
                        //
                        //     setOpen(true);
                        //     setTimeout(() => {
                        //       setOpen(false);
                        //     }, 5000);
                        //   });
                        store.dispatch(updateSpinner(false));
                        setMessage("Your Vote has been registered");
                        setOpen(true);
                        setTimeout(() => {
                            setOpen(false);
                        }, 5000);
                        if (auth && auth.org_id) getOrg(auth.org_id);
                    });
            } else {
                store.dispatch(updateSpinner(false));
                alert("Your vote has already been registered.");
            }
        }
    };
    const finalizeAddMember = async (id, memberAddress) => {
        store.dispatch(updateSpinner(true));
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
            type: "add_member",
        });
        console.log(indexListOftransferProposal);

        const propIndex =
            indexListOftransferProposal?.filter(
                (val) => val.data.toLowerCase() === memberAddress.toLowerCase()
            )[0].index_number - 1;
        console.log(propIndex);
        console.log("Finalizing", propIndex);
        const isAbleTosign = await contract.methods
            .addMemberProposalRequirementMet(propIndex)
            .call();
        const isSigned = await contract.methods
            .isAddMemberProposalDisapproved(propIndex, account)
            .call();
        console.log(isAbleTosign, memberAddress);
        if (isSigned) {
            store.dispatch(updateSpinner(false));
            alert("Member is Disapproved");
        } else {
            if (isAbleTosign) {
                store.dispatch(updateSpinner(true));

                await contract.methods
                    .finalizeAddMemberProposal(propIndex)
                    .send({ from: account })
                    .on("error", (error) => {
                        console.log(error);
                        store.dispatch(updateSpinner(false));
                    })
                    .then((result) => {
                        const formData = new FormData();
                        formData.append("member_id", id);
                        formData.append("voter_id", auth?.id);
                        formData.append("vote", 1);
                        axios
                            .get(
                                `${process.env.REACT_APP_API_URL}/approve_member/${memberAddress}/1`
                            )
                            .then((res) => {
                                store.dispatch(updateSpinner(false));
                                setMessage("Member is Finalized successfully");
                                setOpen(true);
                                setTimeout(() => {
                                    setOpen(false);
                                }, 5000);
                                if (auth && auth.org_id) getOrg(auth.org_id);
                            });
                    });
            } else {
                store.dispatch(updateSpinner(false));
                alert("This Proposal hasn't reached minimum votes required to Finalize.");
            }
        }
    };
    // console.log(auth.org_id);
    const disApprove = async (id, to) => {
        store.dispatch(updateSpinner(true));
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
            type: "add_member",
        });
        console.log(indexListOftransferProposal);

        const propIndex =
            indexListOftransferProposal?.filter(
                (val) => val.data.toLowerCase() === to.toLowerCase()
            )[0].index_number - 1;
        // const propIndex = Number(org?.org?.add_member_index) - 1;
        console.log("DISAPPROVE", id, auth?.id, propIndex);
        const isSigned = await contract.methods
            .isAddMemberProposalDisapproved(propIndex, account)
            .call();
        const isApproved = await contract.methods
            .hasAddMemberProposolSigned(propIndex, account)
            .call();
        console.log(isSigned);
        if (isApproved) {
            store.dispatch(updateSpinner(false));
            alert("You already voted");
        } else {
            if (!isSigned) {
                store.dispatch(updateSpinner(true));

                await contract.methods
                    .disapproveAddMemberProposal(propIndex)
                    .send({ from: account })
                    .on("error", (error) => {
                        console.log(error);
                        store.dispatch(updateSpinner(false));
                    })
                    .then(async (res) => {
                        const response = await axios.post(
                            `${process.env.REACT_APP_API_URL}/add_vote`,
                            {
                                member_id: auth.id,
                                org_id: org?.org?.id,
                                proposal_id: id,
                                proposal_type: 2,
                                vote: 0,
                            }
                        );
                        console.log("Vote Done", response);
                        // const formData: any = new FormData();
                        // formData.append("member_id", id);
                        // formData.append("voter_id", auth?.id);
                        // formData.append("vote", 0);
                        // axios
                        //   .post(`${process.env.REACT_APP_API_URL}/member_vote`, formData)
                        //   .then((res) => {
                        //     store.dispatch(updateSpinner(false));
                        //
                        //     setOpen(true);
                        //     setTimeout(() => {
                        //       setOpen(false);
                        //     }, 5000);
                        //   });
                        store.dispatch(updateSpinner(false));
                        setMessage("Your Vote has been registered");
                        setOpen(true);
                        setTimeout(() => {
                            setOpen(false);
                        }, 5000);

                        if (auth && auth.org_id) getOrg(auth.org_id);
                    });
            } else {
                alert("Already Dissapproved!");
            }
        }
    };
    const approveHandler = (values) => {
        console.log(values);
        setApproveModal(false);
        approve(values.id, values.wallet_address);
    };

    const dissApproveHandler = (values) => {
        console.log(values);
        setDissApproveModal(false);
        disApprove(values.id, values.wallet_address);
    };

    const finalizeHandler = (values) => {
        console.log(values);
        setFinalizeModal(false);
        finalizeAddMember(values.id, values.wallet_address);
    };
    return (
        <div>
            {org &&
                org.members &&
                org.members.length > 0 &&
                org.members
                    .filter((val) => !val.is_active)
                    .map((pro, index) => {
                        return (
                            <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={pro.id}>
                                <div className='flex flex-wrap gap-6 justify-between'>
                                    <div>
                                        Name: <b>{pro.member_name}</b>
                                    </div>
                                    <div>
                                        Wallet Address: <b>{pro.wallet_address}</b>
                                    </div>
                                    <div>
                                        {!pro.finalized && (
                                            <span
                                                onClick={() => {
                                                    setCurrentValues(pro);
                                                    setApproveModal(true);
                                                }}
                                                className="approve cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M5 12l5 5l10 -10"></path>
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {!pro.finalized && (
                                            <span
                                                onClick={() => {
                                                    setCurrentValues(pro);
                                                    setDissApproveModal(true);
                                                }}
                                                className="approve cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M18 6l-12 12"></path>
                                                    <path d="M6 6l12 12"></path>
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <div className='flex gap-3'>
                                        {!pro.finalized && (<Button type='primary' className='grad-btn border-0' onClick={() => {
                                            setCurrentValues(pro);
                                            setFinalizeModal(true);
                                        }}>Finalize</Button>)}
                                        <Button type='primary' className='grad-btn border-0' onClick={() => {
                                            setCurrentValues(pro);
                                            getVotingList(pro, 2);
                                            // setFinalizeModal(true);
                                        }}>View</Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
            }
            <ConfirmModal
                title="Are you sure you want to Approve!"
                open={approveModal}
                setOpen={setApproveModal}
                handler={approveHandler}
                currentValues={currentValues}
            />
            <ConfirmModal
                title="Are you sure you want to Dissapprove!"
                open={dissApproveModal}
                setOpen={setDissApproveModal}
                handler={dissApproveHandler}
                currentValues={currentValues}
            />
            <ConfirmModal
                title="Are you sure you want to Finalize!"
                open={finalizeModal}
                setOpen={setFinalizeModal}
                handler={finalizeHandler}
                currentValues={currentValues}
            />
            <CommonModal
                message={message}
                note=""
                note_bracket=""
                open={open}
                setOpen={setOpen}
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
        auth: state.auth
    };
};

export default connect(mapStateToProps)(AddMemberRequest);