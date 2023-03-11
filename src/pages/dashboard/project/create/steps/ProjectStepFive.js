import React, { useState } from 'react';
import { Button, Form, Input, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons'
import { addProjectFormData } from '../../../../../redux/actions';
import axios from 'axios';
import { getWeb3 } from "../../../../../helpers/currentWalletHelper";
import MultiSig from "../../../../../Config/abis/EquinoxMain.json";
import GToken from "../../../../../Config/abis/GToken.json";
import Eq from "../../../../../Config/abis/EquinoxToken.json";
import { CREATE_PROJECT } from "../../../../../utils";
import { getOrg, getProjects } from '../../../../../services/dashboard';
import Web3 from "web3";
import {
    AwaitingApproval,
    GToken as GTokenModel,
    ContinuePay,
    GasError,
} from "../../../../../components/modals";
import { connect } from 'react-redux';

function ProjectStepFive(props) {
    const [decimal, setDecimal] = useState(18);
    const [amount, setAmount] = useState("100000000000000000000");
    const eqxAdd = "0x54040960e09fb9f1dd533d4465505ba558693ad6";
    const [awaiting, setAwaiting] = useState(false);
    const [gTokenModel, setGTokenModel] = useState(false);
    const [pay, setPay] = useState(false);
    const [gasError, setGasError] = useState(false);

    const toFixed = (x) => {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split("e-")[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = "0." + new Array(e).join("0") + x.toString().substring(2);
            }
        } else {
            var e = parseInt(x.toString().split("+")[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join("0");
            }
        }
        return x;
    };

    const deploy = async (values) => {
        setAwaiting(true);
        let web3 = await getWeb3();

        let contract = new web3.eth.Contract(GToken.abi, eqxAdd);
        let accounts = await web3.eth.getAccounts();
        let multiSig = localStorage.getItem(accounts[0]);

        const amountToPay = Web3.utils.toWei(`${CREATE_PROJECT}`, "ether");
        const tnx = await web3.eth.sendTransaction({
            from: accounts[0],
            to: process.env.REACT_APP_OWNER_ADDRESS,
            value: amountToPay,
        });
        console.log(tnx);
        if (!tnx) return;

        await contract
            .deploy({
                data: GToken.bytecode,
                arguments: [
                    props.projectFormdata?.token_name,
                    props.projectFormdata?.token_ticker,
                    decimal,
                    toFixed(
                        props.projectFormdata?.fixed_supply * 1000000000 * 1000000000
                    ).toLocaleString("fullwide", { useGrouping: false }),
                    accounts[0],
                    props.org.org.multisig_address,
                ],
            })
            .send({ from: accounts[0] })
            .on("error", (err) => {
                console.log(err);
                setAwaiting(false);
                setGasError(true);
            })
            .then(async (receipt) => {
                localStorage.setItem(`${accounts[0]}-gtokne`, receipt._address);
                let GTokenIns = new web3.eth.Contract(GToken.abi, receipt._address);
                let balance = await GTokenIns.methods.balanceOf(accounts[0]).call();
                setAwaiting(false);
                setPay(true);

                await GTokenIns.methods
                    .transfer(props.org.org.multisig_address, balance)
                    .send({ from: accounts[0] })
                    .on("error", (err) => {
                        setPay(false);
                        setGasError(true);
                        if (props.auth && props.auth.org_id) getOrg(props.auth.org_id);
                    })
                    .then((receipt) => {
                        setPay(false);
                        setGTokenModel(true);
                        console.log(receipt); // send to next step
                        addProject(values);
                    });
            });
    };

    const addProject = async (values) => {
        if (props.auth && props.auth.org_id) {
            const skipFields = ['org_id', 'whitepaper', 'incorporation', 'other_doc', 'token_logo'];
            const formData = new FormData();
            formData.append("org_id", props.auth.org_id);
            formData.append("whitepaper", values.whitepaper.file);
            formData.append("incorporation", values.incorporation.file);
            formData.append("other_doc", values.other_doc.file);
            formData.append("token_logo", values.token_logo.file);
            for (const [key, value] of Object.entries(props.projectFormdata)) {
                if (!skipFields.includes(key)) {
                    formData.append(key, value);
                }
            }
            let web3 = await getWeb3();
            let accounts = await web3.eth.getAccounts();
            const gTokenAddr = localStorage.getItem(`${accounts[0]}-gtokne`);
            formData.append("gtoken_address", gTokenAddr);

            axios
                .post(`${process.env.REACT_APP_API_URL}/add_project`, formData)
                .then((res) => {
                    getProjects(res.data.project_id);
                    props.nextStep();
                });
        }
    };
    const [form] = Form.useForm();
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addProjectFormData(values));
        console.log(values, '------')
        deploy(values);
    };
    return (
        <div>
            <div className=' mb-12 text-center'>
                <p>PROJECT LAUNCHER</p>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 5
                </h1>
                <p className='text-base'>
                    Upload Docs
                </p>
            </div>
            <div className='form w-full lg:w-1/2 welcome-card rounded-lg p-6 m-auto'>
                <Form
                    name="dynamic_form_nest_item"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout='vertical'
                    initialValues={{
                        token_logo: "",
                        whitepaper: "",
                        incorporation: "",
                        other_doc: "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Token Logo"
                        name="token_logo"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Upload {...{
                            onRemove: (file) => {
                                form.setFieldValue('token_logo', '')
                            },
                            beforeUpload: (file) => {
                                if (file.size>100*1024){
                                    message.error("File size should not exceed 100kb. You might lose your funds if you proceed with improper file size.")
                                    return Upload.LIST_IGNORE
                                }
                                form.setFieldValue('token_logo', file.file)
                                return false;
                            },
                        }}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        label="Whitepaper (Less than 150 KB, In PDF format)"
                        name="whitepaper"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Upload {...{
                            onRemove: (file) => {
                                form.setFieldValue('whitepaper', '')
                            },
                            beforeUpload: (file) => {
                                if (file.size>150*1024){
                                    message.error("File size should not exceed 150kb.You might lose your funds if you proceed with improper file size.")
                                    return Upload.LIST_IGNORE
                                }
                                form.setFieldValue('whitepaper', file)
                                return false;
                            },
                        }}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        label="Incorporation Certificate (If Applicable)"
                        name="incorporation"
                    >
                        <Upload {...{
                            onRemove: (file) => {
                                form.setFieldValue('incorporation', '')
                            },
                            beforeUpload: (file) => {
                                if (file.size>100*1024){
                                    message.error("File size should not exceed 100kb. You might lose your funds if you proceed with improper file size.")
                                    return Upload.LIST_IGNORE
                                }
                                form.setFieldValue('incorporation', file)
                                return false;
                            },
                        }}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        label="Other Doc (If any)"
                        name="other_doc"
                    >
                        <Upload {...{
                            onRemove: (file) => {
                                form.setFieldValue('other_doc', '')
                            },
                            beforeUpload: (file) => {
                                if (file.size>100*1024){
                                    message.error("File size should not exceed 100kb. You might lose your funds if you proceed with improper file size.")
                                    return Upload.LIST_IGNORE
                                }
                                form.setFieldValue('other_doc', file)
                                return false;
                            },
                        }}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
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
            <ContinuePay
                open={pay}
                setOpen={setPay}
                title="Continue to transfer gTokens to your Treasury Wallet"
            />
            <GTokenModel open={gTokenModel} setOpen={setGTokenModel} />
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        account: state.account,
        projectFormdata: state.projectFormdata,
        auth: state.auth,
        org: state.org,
    };
  };
  
  export default connect(mapStateToProps)(ProjectStepFive);