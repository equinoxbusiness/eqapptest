import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import multiSigv2Abi from "../../../../Config/abis/EquinoxMain.json";
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux//actions";
import ConfirmModal from "../../../../components/modals/ConfirmModal";
import axios from "axios";
import { getOrg } from "../../../../services/dashboard";
import { CommonModal } from "../../../../components/modals";
import DetailModal from '../../../../components/DetailModal';

function OpenForVote(props) {
  const { org, auth } = props;
  const [currentValues, setCurrentValues] = useState({});
  const [approveModal, setApproveModal] = useState(false);
  const [dissApproveModal, setDissApproveModal] = useState(false);
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [message, setMessage] = useState("Your vote has been registered");
  const [msgPopup, setMsgPopup] = useState(false);
  const [view, setView] = useState(false);
  const [voters, setVoter] = useState([]);
  const [votingLoading, setVotingLoading] = useState(false);
  const approve = async (id, status, description) => {
    store.dispatch(updateSpinner(true));
    let web3 = await getWeb3();
    let accounts = await web3.eth.getAccounts();
    let account = accounts[0];
    let multiSigAddr = org?.org?.multisig_address;
    const contract = await new web3.eth.Contract(
      multiSigv2Abi.abi,
      multiSigAddr
    );
    // console.log(auth);

    const {
      data: { response: getIndexOfProposal },
    } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
      org_id: org?.org?.id,
      type: "add_proposal",
    });

    const currentIndex =
      (await getIndexOfProposal.filter((val) => Number(val.data) === id)[0]
        .index_number) - 1;

    console.log(currentIndex);
    // const propIndex = Number(org?.org?.proposal_index) - 1;
    const isSigned = await contract.methods
      .isBasicProposalSigned(currentIndex, account)
      .call();
    const isDisapproveSigned = await contract.methods
      .isBasicProposalDisapproved(currentIndex, account)
      .call();
    console.log(isSigned);
    if (isDisapproveSigned) {
      store.dispatch(updateSpinner(false));
      alert(
        "This Transfer request has been disapproved by one of your team member"
      );
    } else {
      if (!isSigned) {
        await contract.methods
          .signBasicProposal(currentIndex)
          .send({ from: account })
          .on("error", (error) => {
            store.dispatch(updateSpinner(false));
            console.log(error);
          })
          .then(async (result) => {
            try {
              const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/add_vote`,
                {
                  member_id: auth.id,
                  org_id: org?.org?.id,
                  proposal_id: id,
                  proposal_type: 1,
                  vote: 1,
                }
              );
              console.log("Vote Done", response);
              // const formData = new FormData();
              // formData.append("member_id", auth.id);
              // formData.append("proposal_id", id);
              // formData.append("vote", 1);
              // axios
              //   .post(`${process.env.REACT_APP_API_URL}/vote`)
              //   .then((res) => {
              //     console.log(res.data.status);
              //     if (res.data.status === "error") {
              //       toast.error(res.data.message);
              //     } else {
              //       toast.success(res.data.message);
              //     }
              //   });
              store.dispatch(updateSpinner(false));
              setMessage("Your vote has been registerd");
              setMsgPopup(true);
              setTimeout(() => {
                setMsgPopup(false);
              }, 500);
              if (auth && auth.org_id) getOrg(auth.org_id);
            } catch (error) { }
          });
      } else {
        alert("Your vote has already been registered!");
        store.dispatch(updateSpinner(false));
      }
    }
  };
  const finalize = async (id, description) => {
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
      data: { response: getIndexOfProposal },
    } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
      org_id: org?.org?.id,
      type: "add_proposal",
    });

    const currentIndex =
      (await getIndexOfProposal.filter((val) => Number(val.data) === id)[0]
        .index_number) - 1;

    console.log(currentIndex);
    // const propIndex = Number(org?.org?.proposal_index) - 1;
    console.log("PROPOSAL INDEX", currentIndex);
    console.log(auth);
    const isApprovedByAll = await contract.methods
      .basicProposalSignerRequirementMet(currentIndex)
      .call();
    const isDisapproveSigned = await contract.methods
      .isBasicProposalDisapproved(currentIndex, account)
      .call();
    console.log(isApprovedByAll);
    if (isDisapproveSigned) {
      store.dispatch(updateSpinner(false));
      alert(
        "This Transfer request has been disapproved by one of your team member"
      );
    } else {
      if (isApprovedByAll) {
        await contract.methods
          .finalizeBasicProposal(currentIndex)
          .send({ from: account })
          .on("error", (error) => {
            store.dispatch(updateSpinner(false));
            console.log(error);
          })
          .then((result) => {
            const formData = new FormData();
            formData.append("member_id", auth.id);
            formData.append("proposal_id", id);
            formData.append("vote", 1);
            axios
              .post(`${process.env.REACT_APP_API_URL}/finalize_proposal`, {
                id: id,
                status: "Expired",
              })
              .then(async (res) => {
                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL}/add_vote`,
                  {
                    member_id: auth.id,
                    org_id: org?.org?.id,
                    proposal_id: id,
                    proposal_type: 1,
                    vote: 1,
                  }
                );
                console.log("Vote Done", response);
                console.log(res.data.status);
                store.dispatch(updateSpinner(false));
                setMessage("Proposal Finalize successfully");
                setMsgPopup(true);
                setTimeout(() => {
                  setMsgPopup(false);
                }, 500);

                if (auth && auth.org_id) getOrg(auth.org_id);
              });
          });
      } else {
        store.dispatch(updateSpinner(false));
        alert("This Proposal hasn't reached minimum votes required to Finalize.");
      }
    }
  };

  const dissApprove = async (id, description) => {
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
      data: { response: getIndexOfProposal },
    } = await axios.post(`${process.env.REACT_APP_API_URL}/get_index_list`, {
      org_id: org?.org?.id,
      type: "add_proposal",
    });

    const currentIndex =
      (await getIndexOfProposal.filter((val) => Number(val.data) === id)[0]
        .index_number) - 1;

    console.log(currentIndex);
    console.log("PROPOSAL INDEX", currentIndex);
    // const propIndex = Number(org?.org?.proposal_index) - 1;
    const isApproved = await contract.methods
      .isBasicProposalSigned(currentIndex, account)
      .call();
    const isSigned = await contract.methods
      .isBasicProposalDisapproved(currentIndex, account)
      .call();
    console.log(isSigned);
    if (isApproved) {
      store.dispatch(updateSpinner(false));
      alert("Your vote has already been registered!");
    } else {
      if (!isSigned) {
        await contract.methods
          .disapproveBasicProposal(currentIndex)
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
                proposal_type: 1,
                vote: 0,
              }
            );
            console.log("Vote Done", response);
            store.dispatch(updateSpinner(false));
            setMessage("Your vote has been registerd");
            setMsgPopup(true);
            setTimeout(() => {
              setMsgPopup(false);
            }, 500);
            // const formData = new FormData();
            // formData.append("member_id", auth.id);
            // formData.append("proposal_id", id);
            // formData.append("vote", 0);
            // axios
            //   .post(`${process.env.REACT_APP_API_URL}/vote`, formData)
            //   .then((res) => {
            //     console.log(res.data.status);
            //     if (res.data.status === "error") {
            //       toast.error(res.data.message);
            //     } else {
            //       toast.success(res.data.message);
            //     }

            //   });
            if (auth && auth.org_id) getOrg(auth.org_id);
          });
      } else {
        store.dispatch(updateSpinner(false));
        alert("This Transfer request has been disapproved");
      }
    }
  };
  useEffect(() => {
    const checkIfDissapproved = async () => {
      if (org && org.proposal.length > 0) {
        let web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
          multiSigv2Abi.abi,
          multiSigAddr
        );

        org.proposal
          .filter((pro) => pro.status === "Initialized")
          .forEach(async (element) => {
            // console.log(element);
            const {
              data: { response: indexOfProposal },
            } = await axios.post(
              `${process.env.REACT_APP_API_URL}/get_index_list`,
              {
                org_id: org?.org?.id,
                type: "add_proposal",
              }
            );
            const currentIndex =
              (await indexOfProposal.filter(
                (val) => Number(val.data) === element.id
              )[0].index_number) - 1;
            console.log(currentIndex);
            if (contract) {
              const resFromBlock = await contract.methods
                .isFinalBasicProposal(currentIndex)
                .call();
              console.log(currentIndex, resFromBlock);
              if (resFromBlock === true) {
                axios
                  .post(`${process.env.REACT_APP_API_URL}/finalize_proposal`, {
                    id: element.id,
                    status: "Rejected",
                  })
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
  }, [org]);

  const getVotingList = async (pro) => {
    if (org && org?.members?.length > 0) {
      setVotingLoading(true);
      setVoter([]);
      org.members
        .filter((member) => member.is_active === 1)
        .forEach(async (element) => {
          let objectOfMember = {};
          axios
            .get(
              `${process.env.REACT_APP_API_URL}/get_vote_list_by_type/1/${element.id}`
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
  const approveHandler = (values) => {
    setApproveModal(false);
    approve(values.id, 0, values.description);
  };
  const dissApproveHandler = (values) => {
    setDissApproveModal(false);
    dissApprove(values.id, values.description);
  };
  const finalizeHandler = (values) => {
    setFinalizeModal(false);
    finalize(values.id, values.description);
  };
  return (
    <div>
      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-md:grid-cols-2 gap-6 max-lg:text-center">
        {org && org.proposal.length > 0 && org.proposal
          .filter((pro) => pro.status === "Initialized")
          .map((pro, index) => {
            return (
              <div className='welcome-card rounded-lg p-6 mb-3 text-black' key={index}>
                <div className='mb-3'>
                  {pro.description}
                </div>
                <div className='flex gap-6 justify-between'>
                  <div className='flex gap-3'>
                    <div className='self-center'>
                      {
                        <span
                          onClick={() => {
                            // approve(pro.id, 0, pro.description)
                            setCurrentValues(pro);
                            setApproveModal(true);
                          }}
                          className="approve"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M5 12l5 5l10 -10"></path>
                          </svg>
                        </span>
                      }
                    </div>
                    <div className='self-center'>
                      {
                        <span
                          onClick={() => {
                            setCurrentValues(pro);
                            setDissApproveModal(true);
                          }}
                          className="approve disapprove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                        </span>
                      }
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <Button
                      type='primary'
                      className='grad-btn border-0'
                      onClick={() => {
                        setCurrentValues(pro);
                        setFinalizeModal(true);
                      }}
                    >Finalize</Button>
                    <Button
                      type='primary'
                      className='grad-btn border-0'
                      onClick={() => {
                        setCurrentValues(pro);
                        getVotingList(pro);
                      }}
                    >View</Button>
                  </div>
                </div>
              </div>

            );
          })
        }
        <CommonModal
          message={message}
          note="Please be patient till the transaction completes"
          note_bracket="( Do not close the tab or refresh the page )"
          open={msgPopup}
          setOpen={setMsgPopup}
        />
        <ConfirmModal
          title="Are you sure you want to Approve!"
          open={approveModal}
          setOpen={setApproveModal}
          handler={approveHandler}
          currentValues={currentValues}
        />
        <ConfirmModal
          title="Are you sure you want to Disapprove!"
          // note=""
          // note_bracket=""
          open={dissApproveModal}
          setOpen={setDissApproveModal}
          handler={dissApproveHandler}
          currentValues={currentValues}
        />
        <ConfirmModal
          title="Are you sure you want to Finalize!"
          // note=""
          // note_bracket=""
          open={finalizeModal}
          setOpen={setFinalizeModal}
          handler={finalizeHandler}
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
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    org: state.org,
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(OpenForVote);