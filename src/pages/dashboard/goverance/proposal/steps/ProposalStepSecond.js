import React, { useState ,useEffect } from 'react';
import { Button, Form, Input, message, Select, Checkbox } from 'antd';
import { addOrgFormData } from '../../../../../redux/actions';
import axios from 'axios';
import { getWeb3 } from "../../../../../helpers/currentWalletHelper";
import { addProposalFormData ,updateSpinner } from "../../../../../redux/actions";
import multiSigv2Abi from "../../../../../Config/abis/EquinoxMain.json";
import store from "../../../../../redux/store";
import MultiSig from "../../../../../Config/abis/EquinoxMain.json";
import GToken from "../../../../../Config/abis/GToken.json";
import Eq from "../../../../../Config/abis/EquinoxToken.json";
import { CREATE_DAO } from "../../../../../utils";
import { getMe } from '../../../../../services/dashboard';
import Web3 from "web3";
import {
    AwaitingApproval,
    MultiSignature,
    ContinuePay,
    GasError,
    DuplicateError,
} from "../../../../../components/modals";
import { connect } from 'react-redux';
import {
    // CREATE_GOVERNANCE_PROPOSAL,
     CREATE_PROPOSAL_PAYABLE_VALUE,
   } from "../../../../../utils";

function ProposalStepSecond(props) {
    const { org, auth } = props;
    const [signers, setSigners] = useState([]);
    const [message, setMessage] = useState("Member has been removed");
    const [open, setOpen] = useState(false);
    const { TextArea } = Input
    const [form] = Form.useForm();

    useEffect(() => {
        if (org) {
            getSigners();
            // getMemberVotedList(auth.id);
        }
    }, [org]);

    const getSigners = async () => {
        let web3 = await getWeb3();
        let multiSigAddr = org?.org?.multisig_address;
        const contract = await new web3.eth.Contract(
        multiSigv2Abi.abi,
        multiSigAddr
        );
        const returnvalue = await contract.methods.listRemoveMembers().call();
        setSigners(returnvalue);
    };

    const deploy = async (values) => {
        addProposal(values);
        props.dispatch(addProposalFormData(values));
    };
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        deploy(values);
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
    };
    const addProposal = async (values) => {
        if (props.org) {
          store.dispatch(updateSpinner(true));
          let web3 = await getWeb3();
          let accounts = await web3.eth.getAccounts();
          let account = accounts[0];
          let multiSigAddr = org?.org?.multisig_address;
          console.log(multiSigAddr, '----m-----')
          const contract = await new web3.eth.Contract(
            multiSigv2Abi.abi,
            multiSigAddr
          );
          console.log(contract);
    
          // const amountToPay = web3.utils.toWei(
          //   `${CREATE_GOVERNANCE_PROPOSAL}`,
          //   "ether"
          // );
          // const tnx = await web3.eth.sendTransaction({
          //   from: accounts[0],
          //   to: process.env.REACT_APP_OWNER_ADDRESS,
          //   value: amountToPay,
          // });
          // console.log(tnx);
          // if (!tnx) return;
    
          await contract.methods
            .submitBasicProposal()
            .send({
              from: account,
              value: web3.utils.toWei(CREATE_PROPOSAL_PAYABLE_VALUE, "ether"),
            })
            .on("error", (error) => {
              console.log(error);
              store.dispatch(updateSpinner(false));
            })
            .then((result) => {
              console.log("called");
              const skipFields = [];
              const formData = new FormData();
              formData.append("org_id", props?.org?.org?.id);
              formData.append("project_id", props?.org?.project[0]?.id);
              const data = {
                ...props.proposalFormdata,
                ...values,
              };
              for (const [key, value] of Object.entries(data)) {
                if (!skipFields.includes(key)) {
                  formData.append(key, value);
                }
              }
    
              axios
                .post(`${process.env.REACT_APP_API_URL}/add_proposal`, formData)
                .then(async (res) => {
                  const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/add_index/`,
                    {
                      org_id: props.org.org.id,
                      type: "add_proposal",
                      data: res.data.proposal_id,
                    }
                  );
                  console.log("RESPONSE", res.data.proposal_id);
                  store.dispatch(updateSpinner(false));
                  console.log(response);
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                  props.nextStep();
                });
            });
        }
      };
    return (
        <div className='mt-5 flex flex-col items-center justify-center'>
            <div className='text-center mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 2
                </h1>
                <p className='text-base'>
                    Proposals are decisions taken by team and are open for vote in a time bound manner by G-Token holders of the Project.
                </p>
            </div>
            <div className='form w-full lg:w-1/2 welcome-card rounded-lg p-6'>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'
                    initialValues={{
                        description: "",
                        doc: "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Description (Min 200 Words, Max 1000 Words)"
                        name="description"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                message: 'Min 200 Words, Max 1000 Words',
                                validator: (_, value, cb) => {
                                    if (value && value.length >= 200 && value.length <= 1000) {
                                        cb()
                                    } else {
                                        cb('Min 200 Words, Max 1000 Words')
                                    }
                                }
                            }
                        ]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <div className='flex justify-between'>
                        <Button
                            className='mx-0 flex gap-1 bordered border-gray-400 text-gray-400' type="primary"
                            onClick={() => props.previousStep()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-left" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M5 12l14 0"></path>
                                <path d="M5 12l4 4"></path>
                                <path d="M5 12l4 -4"></path>
                            </svg>
                            Previous
                        </Button>
                        <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 grad-btn border-0 '>
                            Next <svg xmlns="http://www.w3.org/2000/svg" className="self-center icon icon-tabler icon-tabler-arrow-narrow-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M5 12l14 0"></path>
                                <path d="M15 16l4 -4"></path>
                                <path d="M15 8l4 4"></path>
                            </svg>
                        </Button>
                        {/* <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 mx-auto grad-btn border-0'>
                                Deploy
                        </Button> */}
                    </div>
                </Form>
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        org: state.org,
        proposalFormdata: state.proposalFormdata,
    };
  };
  
  export default connect(mapStateToProps)(ProposalStepSecond);