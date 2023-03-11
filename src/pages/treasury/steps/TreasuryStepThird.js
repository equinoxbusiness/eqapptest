import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Space } from 'antd';
import { addOrgFormData } from '../../../redux/actions';
import axios from 'axios';
import { getWeb3 } from "../../../helpers/currentWalletHelper";
import MultiSig from "../../../Config/abis/EquinoxMain.json";
import GToken from "../../../Config/abis/GToken.json";
import Eq from "../../../Config/abis/EquinoxToken.json";
import { CREATE_DAO } from "../../../utils";
import { getMe } from '../../../services/dashboard';
import Web3 from "web3";
import {
    AwaitingApproval,
    MultiSignature,
    ContinuePay,
    GasError,
    DuplicateError,
} from "../../../components/modals";
import { connect } from 'react-redux';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

function TreasuryStepThird(props) {
    const [wallets, setWallets] = useState([]);
    const eqxAdd = "0x54040960e09fb9f1dd533d4465505ba558693ad6"; // fetch this address (in this file and in org.jsx file) form pages/Config/contracts.js
    const [multiSigAdd, setMultiSigAdd] = useState("");
    const [awaiting, setAwaiting] = useState(false);
    const [multiSign, setMultiSign] = useState(false);
    const [pay, setPay] = useState(false);
    const [gasError, setGasError] = useState(false);
    const [duplicate, setDuplicate] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [props.walletInfo?.wallet, props.orgFormdata?.email])
    const onFinish = async (fields) => {
        var values = fields.members;
        let hasDuplicates =
        values.map((v) => v.email.toLowerCase()).length >
        new Set(values.map((v) => v.email.toLowerCase())).size
            ? true
            : false;
        if (hasDuplicates) {
            message.error("Duplicate email entry found.!!");
            // alert("Duplicate email entry found.!!");
            return;
        }

        let hasDuplicatewallet =
        values.map((v) => v.wallet).length >
        new Set(values.map((v) => v.wallet)).size
            ? true
            : false;

        if (hasDuplicatewallet) {
            message.error("Duplicate wallet entry found.!!");
            // alert("");
            return;
        }
        props.dispatch(addOrgFormData(fields));
        deploy(fields.members);
    };
    const addOrg = (member) => {
        const skipFields = ["eqxBln", "mobile_otp", "kyc"];
        const formData = new FormData();
        for (const [key, value] of Object.entries(props.orgFormdata)) {
          if (!skipFields.includes(key)) {
            if (key === "wallet") {
              formData.append("wallet_address", value);
            } else {
              formData.append(key, value);
            }
          }
        }
        member.forEach((mem, index) => {
          if (index > 0) {
            formData.append("member_name[]", mem.name);
            formData.append("member_wallet_address[]", mem.wallet);
            formData.append("member_email[]", mem.email);
          }
        });
        const multisigAddress = localStorage.getItem(props.walletInfo.wallet);
        formData.append("multisig_address", multisigAddress);
        axios
          .post(`${process.env.REACT_APP_API_URL}/add_org`, formData)
          .then((res) => {
            console.log(res);
            const account = sessionStorage.getItem("selected_account");
            if (account) {
              getMe(account);
            }
            props.nextStep();
          })
          .catch((err) => {
            console.log(err);
            setDuplicate(true);
          });
    };
    
    const deploy = async (member) => {
        setAwaiting(true);
    
        let web3 = await getWeb3();
    
        let contract = new web3.eth.Contract(MultiSig.abi); //MultiSig
    
        let gContract = new web3.eth.Contract(GToken.abi);
    
        let eqxContract = new web3.eth.Contract(Eq.abi, eqxAdd);
        let accounts = await web3.eth.getAccounts();
        member.forEach((mem) => {
          wallets.push(mem.wallet);
        });
        try {
          // this will deploy MultiSig contract that will give _address in response
          // 100 equinox will deposited to multisig address at the end
          // multisig contract address against user wallet address should be saved to databas at this step
          // because user has deposited his 100eqx at multisig
    
          const amountToPay = Web3.utils.toWei(`${CREATE_DAO}`, "ether");
          const tnx = await web3.eth.sendTransaction({
            from: accounts[0],
            to: process.env.REACT_APP_OWNER_ADDRESS,
            value: amountToPay,
          });
          if (!tnx) return;
          console.log(tnx);
    
          await contract
            .deploy({
              //multisig contract creation
              data: MultiSig.bytecode,
              arguments: [wallets, eqxAdd], // constructor arguments
            })
            .send({ from: props.walletInfo.wallet })
            .on("error", (err) => {
              console.log(err);
              setGasError(true);
            })
            .then(async (receipt) => {
              localStorage.setItem(props.walletInfo.wallet, receipt._address);
              setAwaiting(false);
              setPay(true);
              addOrg(member);
              console.log(receipt);
              setPay(false);
              // await eqxContract.methods
              //   .transfer(receipt._address, amount)
              //   .send({ from: props.walletInfo.wallet })
              //   .then(function (receipt) {
              //   })
              //   .catch((err) => {
              //
              //   });
            });
          // await gContract.deploy({ // gtoken contraction creation
          //   data:GToken.bytecode,
          //   arguments: [name, symbol, decimal, totalSupply, props.walletInfo.wallet, receipt._address, ] // constructor arguments
          // })
          // .send({from: props.walletInfo.wallet})
          // .on('error', (error) => {
          //   console.log("gtoken error", error)
          // }).then((gReceipt) => {
          //   console.log('receipt', gReceipt)
          //   console.log('Gtoken address', gReceipt._address);
          // })
        } catch (error) {
          // alert("Duplicate entry found");
          // setGasError(true);
          console.log(error);
          setAwaiting(false);
          setPay(false);
          setGasError(true);
        }
    };
    const verifyEmail = (_, value, cb) => {
      // try {
      //   axios.post(
      //     `${process.env.REACT_APP_API_URL}/check_org`,
      //     {
      //       email: value,
      //     }
      //   );
      //   if (data.data.length) {
      //     cb("Allready exist in another treasury");
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
      // try {
      //   const { data } = await axios.post(
      //     `${process.env.REACT_APP_API_URL}/check_member`,
      //     {
      //       email: value,
      //     }
      //   );
      //   if (data.data.length) {
      //     cb("Allready exist in another treasury");
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
  
      axios
        .get(`${process.env.REACT_APP_API_URL}/check_email/${value}`)
        .then((res) => {
          if (res?.data?.data.length) {
            cb("Email already exist")
          } else {
            cb()
          }
        })
        .catch((e) => {
          cb()
        });
    };
    const verifyWallet = (_, value, cb) => {
      // try {
      //   const { data } = await axios.post(
      //     `${process.env.REACT_APP_API_URL}/check_org`,
      //     {
      //       wallet_address: value,
      //     }
      //   );
      //   if (data.data.length) {
      //     cb("Allready exist in another treasury");
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
      // try {
      //   const { data } = await axios.post(
      //     `${process.env.REACT_APP_API_URL}/check_member`,
      //     {
      //       wallet_address: value,
      //     }
      //   );
      //   if (data.data.length) {
      //     cb("Allready exist in another treasury");
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
  
      axios
        .get(`${process.env.REACT_APP_API_URL}/get_details/${value}`)
        .then((res) => {
          cb('Already exist');
        })
        .catch((e) => {
          cb()
        });
    };
    return (
        <div className='mt-5 flex flex-col items-center justify-center'>
            <div className=' mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 3
                </h1>
                <p className='text-base'>
                    Deployer KYC
                </p>
            </div>
            <div className='form w-full lg:w-1/2 welcome-card rounded-lg p-6'>
            <Form
                name="dynamic_form_nest_item"
                onFinish={onFinish}
                autoComplete="off"
                layout='vertical'
                initialValues={{
                    members: [
                        {
                            wallet: props.walletInfo.wallet,
                            name: props.orgFormdata?.deployer_name,
                            email: props.orgFormdata?.email,
                        },
                        {
                            wallet: '',
                            name: '',
                            email: '',
                        },
                        {
                            wallet: '',
                            name: '',
                            email: '',
                        },
                    ],
                }}
                form={form}
            >
                <Form.List name="members">
                {(fields, { add, remove }) => (
                    <>
                    {fields.map(({ key, name, ...restField }, i) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                            {...restField}
                            name={[name, 'wallet']}
                            validateTrigger="onBlur"
                            rules={[
                              { 
                                required: true,
                                message: 'Wallet is required'
                              },
                              {
                                message: 'Wallet alreasy exist',
                                validator: verifyWallet
                            }
                            ]}

                        >
                            <Input placeholder="Wallet" disabled={i===0}/>
                        </Form.Item>
                        <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ required: true, message: 'Name is required' }]}
                        >
                            <Input placeholder="Name" disabled={i===0}/>
                        </Form.Item>
                        <Form.Item
                            {...restField}
                            name={[name, 'email']}
                            validateTrigger="onBlur"
                            rules={[
                              { 
                                required: true,
                                message: 'Email is required'
                              },
                              { 
                                type: 'email',
                                message: 'Email is invalid'
                              },
                              { 
                                message: 'Email alreasy exist',
                                validator: verifyEmail
                              }
                            ]}
                        >
                            <Input placeholder="Email" disabled={i===0}/>
                        </Form.Item>
                        {i!==0&&<MinusCircleOutlined onClick={() => remove(name)} />}
                        </Space>
                    ))}
                    <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add field
                        </Button>
                    </Form.Item>
                    </>
                )}
                </Form.List>
                    <div className='flex'>
                        <Button
                            className='mx-0 flex gap-1 mx-auto bordered border-gray-400 text-gray-400' type="primary"
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
                        {/* <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 mx-auto grad-btn border-0 '>
                            Next <svg xmlns="http://www.w3.org/2000/svg" className="self-center icon icon-tabler icon-tabler-arrow-narrow-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M5 12l14 0"></path>
                                <path d="M15 16l4 -4"></path>
                                <path d="M15 8l4 4"></path>
                            </svg>
                        </Button> */}
                        <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 mx-auto grad-btn border-0'>
                                Deploy
                        </Button>
                    </div>
                </Form>
            </div>
            <AwaitingApproval open={awaiting} setOpen={setAwaiting} />
            <GasError open={gasError} setOpen={setGasError} />
            <ContinuePay open={pay} setOpen={setPay} />
            <MultiSignature open={multiSign} setOpen={setMultiSign} />
            <DuplicateError open={duplicate} setOpen={setDuplicate} />
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
      orgFormdata: state.orgFormdata,
    };
  };
  
  export default connect(mapStateToProps)(TreasuryStepThird);