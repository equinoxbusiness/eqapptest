import { Breadcrumb, Button, Form, Input, message, Select } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from "react-redux";
import axios from "axios";
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import MultiSig from "../../../../Config/abis/EquinoxMain.json";
import { updateSpinner } from "../../../../redux/actions";
import store from "../../../../redux/store";
import {
  CREATE_PROPOSAL_PAYABLE_VALUE,
  //CREATE_REMOVE_MEMBER,
} from "../../../../utils";

function RemoveMembers(props) {
    const { org } = props;
    const { Option } = Select;
    const navigate = useNavigate();
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        removeMember(values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit success!');
    };
    const [form] = Form.useForm();
    const removeMember = async (values) => {
        if (org && org.members && org.members.length <= 3) {
          message.error(
            "Cant process this proposal if only 3 members are present in treasury"
          );
          return;
        }
    
        store.dispatch(updateSpinner(true));
        const web3 = await getWeb3();
        const multiSigAddr = org?.org?.multisig_address;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const contract = await new web3.eth.Contract(MultiSig.abi, multiSigAddr);
        console.log("WORKING ON REMOVE MEMBERS");
        console.log(values);
        const formData = values;
        formData.org_id = org?.org?.id;
        // const postRemovemember = await axios
        //   .post(`${process.env.REACT_APP_API_URL}/add_remove_member`, formData)
        //   .then((data) => {
        //     console.log(data);
        //     console.log(postRemovemember);
        //   })
        //   .catch((error) => console.log(error));'
        // const amountToPay = web3.utils.toWei(`${CREATE_REMOVE_MEMBER}`, "ether");
        // const tnx = await web3.eth.sendTransaction({
        //   from: accounts[0],
        //   to: process.env.REACT_APP_OWNER_ADDRESS,
        //   value: amountToPay,
        // });
        // console.log(tnx);
        // if (!tnx) return;
        await contract.methods
          .removeMemberProposal(values.member_wallet_address)
          .send({
            from: account,
            value: web3.utils.toWei(CREATE_PROPOSAL_PAYABLE_VALUE, "ether"),
          })
          .on("error", (error) => console.log(error))
          .then((result) => {
            axios
              .post(`${process.env.REACT_APP_API_URL}/add_remove_member`, formData)
              .then(async (data) => {
                console.log(data);
    
                if (data) {
                  const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/add_index/`,
                    {
                      org_id: props.org?.org?.id,
                      type: "remove_member",
                      data: data.data.member_id,
                    }
                  );
                  console.log(response);
                }
              })
              .catch((error) => console.log(error));
    
            store.dispatch(updateSpinner(false));
    
            message.success('Remove Member Proposal Initialised')
            setTimeout(() => {
              navigate("/dashboard/members");
            }, 1000);
        });
    };
    const handleChange = (value) => {
        form.setFieldValue("member_wallet_address", value);
        if (org && org.members && org.members.length) {
          const index = org.members.findIndex(
            (mem) => mem.wallet_address === value
          );
          if (index >= 0) {
            
            form.setFieldValue("member_name", org.members[index].member_name);
            form.setFieldValue("member_email", org.members[index].email);
          }
        }
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
        <div>
            <div className='mb-4 text-white'>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to='/dashboard'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className=''>  <Link to='/dashboard/members'>Members</Link></Breadcrumb.Item>
                    <Breadcrumb.Item className='font-bold text-pink-500'>Remove</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div>
                <h1 className='font-bold text-xl mb-2'>
                    Remove EQ Vault Member
                </h1>
                <p className='mb-6 w-3/5 lg:width-full'>
                    EQ Vault Members are core team members and weild equal rights for it's operations and in decision making. Member's may inititate the addition and removal instance. It needs appraval of more than 50% members for its success.
                </p>
            </div>
            <div className='form w-1/2 lg:width-full welcome-card rounded-lg p-6'>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        member_name: "",
                        member_wallet_address: "",
                        member_email: "",
                    }}
                    autoComplete="off"
                    layout='vertical'
                    form={form}
                >
                    <Form.Item
                        label="Wallet"
                        name="member_wallet_address"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your wallet address!',
                            },
                        ]}
                    >
                        <Select onChange={(e) => handleChange(e)}>
                            {(org?.members
                              ? org.members.filter(
                                  (val) => val.is_active === 1
                                )
                              : []).map((member) => {
                                {console.log(member)}
                                return <Option key={member.wallet_address} value={member.wallet_address}>{member.wallet_address}</Option>
                              })}
                        </Select>
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
                        <Input disabled={true}/>
                    </Form.Item>
                    <Form.Item
                        label="Email Address"
                        name="member_email"
                        rules={[
                            {
                                type: 'email',
                                required: true,
                                message: 'Please input your email!',
                            },
                        ]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    

                    <Form.Item >
                        <p className='text-center mt-3'>
                            New Member will be removed once all the existing members approve the removal instance witin 7 days
                        </p>
                    </Form.Item>

                    <Form.Item className=''>
                        <div className='text-center'>
                            <Button type="primary" className='flex gap-1 mx-auto grad-btn border-0 ' htmlType="submit">
                                Remove <svg xmlns="http://www.w3.org/2000/svg" className="self-center icon icon-tabler icon-tabler-arrow-narrow-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
  
  export default connect(mapStateToProps)(RemoveMembers);