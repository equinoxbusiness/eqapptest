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
import DetailModal from '../../../../components/DetailModal';

function RemoveMemberRequest(props) {
    const { org, auth } = props;
    const [signers, setSigners] = useState([]);
    const [currentValues, setCurrentValues] = useState({});
    const [approveModal, setApproveModal] = useState(false);
    const [dissApproveModal, setDissApproveModal] = useState(false);
    const [finalizeModal, setFinalizeModal] = useState(false);
    const [voters, setVoter] = useState([]);
    const [view, setView] = useState(false);
    const [votingLoading, setVotingLoading] = useState(false);
    const [message, setMessage] = useState("Member has been removed");
    const [open, setOpen] = useState(false);
    const [removeMemberList, setRemoveMemberList] = useState([]);
    const [approveRemoveMemberModal, setApproveRemoveMemberModal] = useState(false);
    const [dissApproveRemoveMemberModal, setDissApproveRemoveMemberModal] = useState(false);
    const [finalizeRemoveMemberModal, setFinalizeRemoveMemberModal] = useState(false);
    useEffect(() => {
        if (org?.org, auth) {
          getSigners();
          getMemberVotedList(auth.id);
          getRemoveMembersList(org);
        }
    }, [org, auth]);
    useEffect(() => {
        //REMOVE MEMBER DISSAPPROVED CHECK
        const checkIfDissapproved = async () => {
          if (org && org.members.length > 0) {
            let web3 = await getWeb3();
            let accounts = await web3.eth.getAccounts();
            // let account = accounts[0];
            let multiSigAddr = org?.org?.multisig_address;
            const contract = await new web3.eth.Contract(
              multiSigv2Abi.abi,
              multiSigAddr
            );
            console.log("REMOVE MEMBER");
            removeMemberList.length > 0 &&
              removeMemberList.forEach(async (element) => {
                console.log(element);
    
                const {
                  data: { response: indexListOftransferProposal },
                } = await axios.post(
                  `${process.env.REACT_APP_API_URL}/get_index_list`,
                  {
                    org_id: org?.org?.id,
                    type: "remove_member",
                  }
                );
                console.log(indexListOftransferProposal);
    
                const propIndex =
                  indexListOftransferProposal?.filter(
                    (val) => Number(val.data) === element.id
                  )[0].index_number - 1;
                console.log(propIndex);
                if (contract) {
                  const resFromBlock = await contract.methods
                    .isFinalRemoveMemberProposal(propIndex)
                    .call();
                  console.log(propIndex, resFromBlock);
                  if (resFromBlock === true) {
                    // if (false) {
                    axios
                      .get(
                        `${process.env.REACT_APP_API_URL}/approve_remove_member/${element.wallet_address}/-1`
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
    }, [auth, org, removeMemberList]);
    const getRemoveMembersList = async (org) => {
        try {
          console.log(org);
          const {
            data: { response },
          } = await axios.get(
            `${process.env.REACT_APP_API_URL}/get_remove_member_list/${org.org.id}/0`
          );
          console.log(response);
          setRemoveMemberList(response);
        } catch (error) {
          console.log(error);
        }
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
        console.log(indexListOftransferProposal);

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
                        // const formData = new FormData();
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
                        // const formData = new FormData();
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
    //REMOVE MEMBER _FUNCTIONS
  const approveRemoveMember = async (proposal) => {
    console.log("APPROVE REMOVE", proposal);
    store.dispatch(updateSpinner(true));
    // return;
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
      type: "remove_member",
    });
    console.log(indexListOftransferProposal);

    const propIndex =
      indexListOftransferProposal?.filter(
        (val) => Number(val.data) === proposal.id
      )[0].index_number - 1;
    console.log(propIndex);
    // const propIndex = Number(org?.org?.remove_member_index) - 1;
    const isRemoveMemberSigned = await contract.methods
      .removeMemberProposalSigned(propIndex, account)
      .call();
    console.log(isRemoveMemberSigned);
    const isSigned = await contract.methods
      .isRemoveMemberProposalDisapproved(propIndex, account)
      .call();
    console.log(isSigned);
    if (isSigned) {
      alert("Member is Disapproved");
      store.dispatch(updateSpinner(false));
    } else {
      if (!isRemoveMemberSigned) {
        store.dispatch(updateSpinner(true));
        await contract.methods
          .signRemoveMemberProposal(propIndex)
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
                proposal_id: proposal.id,
                proposal_type: 3,
                vote: 1,
              }
            );
            console.log("Vote Done", response);
            store.dispatch(updateSpinner(false));

            setMessage("Your Vote has been registered");
            setOpen(true);
            setTimeout(() => {
              setOpen(false);
            }, 5000);
            console.log(result);
          });
      } else {
        alert("Your vote has already been registered.");
      }
    }
  };

  const disapproveRemoveMember = async (proposal) => {
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
      type: "remove_member",
    });
    console.log(indexListOftransferProposal);

    const propIndex =
      indexListOftransferProposal?.filter(
        (val) => Number(val.data) === proposal.id
      )[0].index_number - 1;
    console.log(propIndex);
    // const propIndex = Number(org?.org?.remove_member_index) - 1;
    const isSigned = await contract.methods
      .isRemoveMemberProposalDisapproved(propIndex, account)
      .call();
    const isApproved = await contract.methods
      .hasRemoveMemberProposolSigned(propIndex, account)
      .call();
    if (isApproved) {
      alert("Your vote already registered");
      store.dispatch(updateSpinner(false));
    } else {
      console.log(isSigned);
      if (!isSigned) {
        store.dispatch(updateSpinner(true));
        await contract.methods
          .disapproveRemoveMemberProposal(propIndex)
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
                proposal_id: proposal.id,
                proposal_type: 3,
                vote: 0,
              }
            );
            store.dispatch(updateSpinner(false));
            console.log("Vote Done", response);
            setMessage("Your Vote has been registered");
            setOpen(true);
            setTimeout(() => {
              setOpen(false);
            }, 5000);
          });
      } else {
        alert("Already Dissapproved!");
      }
    }
  };

  const finalizeRemoveMember = async (to) => {
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
      type: "remove_member",
    });
    console.log(indexListOftransferProposal);
    const propIndex =
      indexListOftransferProposal?.filter(
        (val) => Number(val.data) === to.id
      )[0].index_number - 1;
    console.log(propIndex);
    const isRemoveMemberAllSigned = await contract.methods
      .hasRemoveMemberProposolSigned(propIndex, account)
      .call();
    console.log(isRemoveMemberAllSigned);
    const isSigned = await contract.methods
      .isRemoveMemberProposalDisapproved(propIndex, account)
      .call();
    console.log(isSigned);

    const isFullySigned = await contract.methods
      .removeProposalRequirementMet(propIndex)
      .call();
    console.log(isFullySigned);
    if (isFullySigned) {
      if (isSigned) {
        store.dispatch(updateSpinner(false));
        alert("Member is Disapproved");
      } else {
        if (isRemoveMemberAllSigned) {
          await contract.methods
            .removeWalletMember(propIndex)
            .send({ from: account })
            .on("error", (error) => {
              console.log(error);
              store.dispatch(updateSpinner(false));
            })
            .then((result) => {
              console.log(result);
              const formData = new FormData();
              formData.append("wallet_address", to.wallet_address);
              axios
                .get(
                  `${process.env.REACT_APP_API_URL}/approve_remove_member/${to.wallet_address}/1`
                )
                .then((res) => {
                  axios
                    .get(
                      `${process.env.REACT_APP_API_URL}/approve_member/${to.wallet_address}/-1`
                    )
                    .then((res) => {
                      store.dispatch(updateSpinner(false));
                      setMessage("Member has been removed");
                      setOpen(true);

                      setTimeout(() => {
                        setOpen(false);
                      }, 5000);
                      console.log(res);
                      getSigners();
                    });
                });
            });
        } else {
          alert("This Proposal hasn't reached minimum votes required to Finalize.");
        }
      }
    } else {
      alert("This Proposal hasn't reached minimum votes required to Finalize.");
    }
    };
    const getSigners = async () => {
        let web3 = await getWeb3();
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );
        const returnvalue = await contract.methods.listRemoveMembers().call();
        console.log(returnvalue);
        setSigners(returnvalue);
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
    const removeApproveHandler = (values) => {
        console.log(values);
        setApproveRemoveMemberModal(false);
        approveRemoveMember(values);
      };
      const removeDissApproveHandler = (values) => {
        console.log(values);
        setDissApproveRemoveMemberModal(false);
        disapproveRemoveMember(values);
      };
      const removeFinalizeHandler = (values) => {
        console.log(values);
        setFinalizeRemoveMemberModal(false);
        finalizeRemoveMember(values);
      };
    return (
        <div>
           {removeMemberList.length > 0 &&
            removeMemberList.map((pro, index) => {
                return (
                    <div className='welcome-card rounded-lg p-6 mb-6 text-black' key={pro.id}>
                        <div className='flex flex-wrap gap-6 justify-between'>
                            <div>
                                Wallet Address: <b>{pro.wallet_address}</b>
                            </div>
                            <div>
                                {!pro.finalized && (
                                    <span
                                    onClick={() => {
                                        setCurrentValues(pro);
                                        setApproveRemoveMemberModal(true);
                                    }}
                                    className="approve"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M5 12l5 5l10 -10"></path>
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <div>
                                <span
                                onClick={() => {
                                    setCurrentValues(pro);
                                    setDissApproveRemoveMemberModal(true);
                                }}
                                className="approve"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M18 6l-12 12"></path>
                                        <path d="M6 6l12 12"></path>
                                    </svg>
                                </span>
                            </div>
                            <div className='flex gap-3'>
                                {!pro.finalized && (<Button type='primary' className='grad-btn border-0'  onClick={() => {
                                     setCurrentValues(pro);
                                     setFinalizeRemoveMemberModal(true);
                                }}>Finalize</Button>)}
                                <Button type='primary' className='grad-btn border-0'  onClick={() => {
                                    setCurrentValues(pro);
                                    getVotingList(pro, 3);
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
            <ConfirmModal
                title="Are you sure you want to Approve!"
                open={approveRemoveMemberModal}
                setOpen={setApproveRemoveMemberModal}
                handler={removeApproveHandler}
                currentValues={currentValues}
            />
            <ConfirmModal
                title="Are you sure you want to Dissapprove!"
                open={dissApproveRemoveMemberModal}
                setOpen={setDissApproveRemoveMemberModal}
                handler={removeDissApproveHandler}
                currentValues={currentValues}
            />
            <ConfirmModal
                title="Are you sure you want to Finalize!"
                open={finalizeRemoveMemberModal}
                setOpen={setFinalizeRemoveMemberModal}
                handler={removeFinalizeHandler}
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
      auth: state.auth
    };
};
  
export default connect(mapStateToProps)(RemoveMemberRequest);