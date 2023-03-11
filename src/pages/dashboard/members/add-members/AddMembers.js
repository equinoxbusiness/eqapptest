import { Breadcrumb, Button, Form, Input, message } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import store from "../../../../redux/store";
import { updateSpinner } from "../../../../redux/actions";
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import { useNavigate  } from 'react-router-dom';
import MultiSig from "../../../../Config/abis/EquinoxMain.json";
import {
    //CREATE_ADD_MEMBER,
    CREATE_PROPOSAL_PAYABLE_VALUE,
  } from "../../../../utils";
import { connect } from 'react-redux';

function AddMembers(props) {
    const { org } = props;
    const navigate = useNavigate();
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        addMember(values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
    };
    const addMember = async (values) => {
        console.log(values)
        store.dispatch(updateSpinner(true));
        const formData = values;
        formData.org_id = org?.org?.id;
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const multiSigAddr = org?.org?.multisig_address;
        const account = accounts[0];
        const contract = await new web3.eth.Contract(MultiSig.abi, multiSigAddr);
        console.log(org?.members);
    
        const isAlreadyAdded = org?.members.filter(
          (val) => val.wallet_address === values.member_wallet_address
        );
        console.log(isAlreadyAdded);
    
        if (isAlreadyAdded.length > 0) {
          message.error('Duplicate wallet address');
          store.dispatch(updateSpinner(false));
          return;
        }
        // const amountToPay = web3.utils.toWei(`${CREATE_ADD_MEMBER}`, "ether");
        // const tnx = await web3.eth.sendTransaction({
        //   from: accounts[0],
        //   to: process.env.REACT_APP_OWNER_ADDRESS,
        //   value: amountToPay,
        // });
        // console.log(tnx);
        // if (!tnx) return;
        await contract.methods
          .addMemberProposal(values.member_wallet_address)
          .send({
            from: account,
            value: web3.utils.toWei(CREATE_PROPOSAL_PAYABLE_VALUE, "ether"),
          })
          .on("error", (error) => {
            store.dispatch(updateSpinner(false));
            console.log(error);
          })
          .then(() => {
            axios
              .post(`${process.env.REACT_APP_API_URL}/add_member`, formData)
              .then(async (res) => {
                const response = await axios
                  .post(`${process.env.REACT_APP_API_URL}/add_index/`, {
                    org_id: props.org?.org?.id,
                    type: "add_member",
                    data: values.member_wallet_address,
                  })
                  .then(() => {})
                  .catch((e) => {
                    console.log(e);
                    store.dispatch(updateSpinner(false));
                  });
                console.log("INDEX UPDATED", response);
                store.dispatch(updateSpinner(false));
                message.success('Member added successfully')
                navigate("/dashboard/members");
              })
              .catch((err) => {
                message.error(err.message);
                store.dispatch(updateSpinner(false));
              });
          });
    };
    const checkAddress = (_, value, cb) => {
        axios
        .get(`${process.env.REACT_APP_API_URL}/get_details/${value}`)
        .then((res) => {
          cb('Already exist');
        })
        .catch((e) => {
          cb()
        });
    };
    const verifyEmail = (_, value, cb) => {
        axios.get(`${process.env.REACT_APP_API_URL}/check_email/${value}`)
            .then((res) => {
                if (res?.data?.data.length) {
                    cb(`not a valid email`)
                } else {
                    // axios.get(
                    //     `${process.env.REACT_APP_API_URL}/send_activation_code/${value}`
                    // ).then((res) => {
                        cb()
                    // })
                    // .catch((er) => {
                    //     console.log(er)
                    //     cb()
                    // });
                }
            })
            .catch((e) => {
                cb()
            });
    }
    return (
        <div className='text-center'>
            <div className='mb-4 text-white'>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to='/dashboard'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className=''>  <Link to='/dashboard/members'>Members</Link></Breadcrumb.Item>
                    <Breadcrumb.Item className='font-bold text-pink-500'>Add</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div>
                <h1 className='font-bold text-xl mb-2'>
                    EQ Vault member
                </h1>
                <p className='mb-6 w-3/5 mx-auto max-lg:w-full'>
                    EQ Vault Members are core team members and weild equal rights for it's operations and in decision making. Member's may inititate the addition and removal instance. It needs appraval of more than 50% members for its success.
                </p>
            </div>
            <div className='mx-auto form w-1/2 max-md:w-full max-lg:w-4/5 welcome-card rounded-lg p-6'>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        member_name: "",
                        member_wallet_address: "",
                        member_email: "",
                        // otp: "",
                    }}
                    autoComplete="off"
                    layout='vertical'
                >
                    <Form.Item
                        label="Wallet"
                        name="member_wallet_address"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                message: 'Allready exist',
                                validator: checkAddress
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Full Name"
                        name="member_name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email Address"
                        name="member_email"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                type: 'email',
                                required: true,
                                message: 'Please input your emailaddress!',
                            },
                            {
                                message: 'Allready exist',
                                validator: verifyEmail
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    {/* <div className='flex gap-3'>
                        <div className='w-5/6'>
                            <Form.Item
                                label="OTP"
                                name="full-name"
                                tooltip="What do you want others to call you?"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your username!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </div>
                        <div className='w-2/12 mt-5'>
                            <Button type="primary" className='w-full grad-btn border-0 mt-3'>
                                Submit
                            </Button>
                        </div>
                    </div> */}

                    <Form.Item >
                        <p className='text-center mt-3'>
                            New Member will get an email link for updating further profile
                        </p>
                    </Form.Item>

                    <Form.Item className=''>
                        <div className='text-center'>
                            <Button type="primary" className='flex gap-1 mx-auto grad-btn border-0 ' htmlType="submit">
                                Add <svg xmlns="http://www.w3.org/2000/svg" className="self-center icon icon-tabler icon-tabler-arrow-narrow-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M5 12l14 0"></path>
                                    <path d="M15 16l4 -4"></path>
                                    <path d="M15 8l4 4"></path>
                                </svg>
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
      org: state.org,
    };
};

export default connect(mapStateToProps)(AddMembers);