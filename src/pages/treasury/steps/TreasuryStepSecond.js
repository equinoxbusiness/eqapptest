import React, { useState } from 'react';
import { Button, Form, Input, message, Select, Upload, Checkbox } from 'antd';
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

function TreasuryStepSecond(props) {
    const [mailOtpNote, setMailOtpNote] = useState(false);
    const [awaiting, setAwaiting] = useState(false);
    const [multiSign, setMultiSign] = useState(false);
    const [pay, setPay] = useState(false);
    const [gasError, setGasError] = useState(false);
    const [duplicate, setDuplicate] = useState(false);
    const eqxAdd = "0x54040960e09fb9f1dd533d4465505ba558693ad6"; // fetch this address (in this file and in org.jsx file) form pages/Config/contracts.js
    const [form] = Form.useForm();
    const { Option } = Select;
    const onFinish = async (values) => {
        console.log(values);
        await new Promise((r) => setTimeout(r, 500));
        console.log(values);
        props.dispatch(addOrgFormData(values));
        console.log("calling");
        props.nextStep();
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
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
                    //     setMailOtpNote(true);
                    //     cb()
                    // })
                    // .catch((er) => {
                    //     console.log(er)
                        cb()
                    // });
                }
            })
            .catch((e) => {
                cb()
            });
    }
    return (
        <div className='mt-5 flex flex-col items-center justify-center'>
            <div className=' mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 2
                </h1>
                <p className='text-base'>
                    Deployer KYC
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
                        email: "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Email ID"
                        name="email"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                type: 'email',
                                message: 'Invalid email'
                            },
                            {
                                message: 'Email alreasy exist',
                                validator: verifyEmail
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label={``} name="tandc" valuePropName="checked">
                        <Checkbox>By clicking Next, you agree to our
                            <span>
                              <a
                                target="_blank"
                                href="https://equinox.business"
                              >
                                <b>Terms of service.</b>
                              </a>
                            </span>
                            You may receive Email notifications from us and can
                            opt out at any time.</Checkbox>
                    </Form.Item>
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
                        <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 mx-auto grad-btn border-0 '>
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
  
  export default connect(mapStateToProps)(TreasuryStepSecond);