import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { addIcoFormData } from '../../../../../redux/actions';
import { connect } from "react-redux";
import { getWeb3 } from "../../../../../helpers/currentWalletHelper";
import { toFixed } from "../../../../../helpers/numberFormatter";
import MultiSig from "../../../../../Config/abis/EquinoxMain.json";
import Ico from "../../../../../Config/abis/subscriptionMain.json";
import axios from "axios";
import {
    AwaitingApproval,
    GasError,
} from "../../../../../components/modals";
import Web3 from "web3";
import {
    CREATE_PROPOSAL_PAYABLE_VALUE,
} from "../../../../../utils";

function IcoStepSecond(props) {
    const { org, icoFormdata } = props;
    const [tokenAmount, setTokenAmount] = useState(0); //amount of gtoken to sell in ico
    const [minBuy, setMinBuy] = useState(10); // min amount a uer should buy
    const [awaiting, setAwaiting] = useState(false);
    const [gasError, setGasError] = useState(false);

    let multiSigAddr // multisig contract address
    let gTokenAddr
    let account
    let web3
    const setInfo = async () => {
        web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        account = accounts[0];
        //multiSigAddr = localStorage.getItem(account);

        window.localStorage.setItem(
            `${account}-gtokne`,
            `${org?.project[0]?.gtoken_address}`
        );
        gTokenAddr = localStorage.getItem(`${account}-gtokne`);
        console.log("gtoken", gTokenAddr);
        if (!gTokenAddr) {
            gTokenAddr = gTokenAddr;
        }
    };

    const deploy = async (values) => {
        setAwaiting(true);
        await setInfo();
        const startTime = new Date(values.start_date).getTime() / 1000;
        const endTime = new Date(values.end_date).getTime() / 1000;
        const rate = values.offer_price;
        const softCap = values.soft_cap;
        const hardCap = values.hard_cap;
        multiSigAddr = org?.org?.multisig_address;
        let icoContract = await new web3.eth.Contract(Ico.abi);
        const productowner = process.env.REACT_APP_OWNER_ADDRESS;
        const dexAdd = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // fetch this address (in this file and in org.jsx file) form pages/Config/contracts.js
        console.log(
            values,
            icoFormdata,
            toFixed(values.supply * 1000000000 * 1000000000).toLocaleString(
                "fullwide",
                {
                    useGrouping: false,
                }
            )
        );

        // const amountToPay = Web3.utils.toWei(
        //   `${CREATE_SUBSCRIPTION_PROPOSAL}`,
        //   "ether"
        // );
        // let accounts = await web3.eth.getAccounts();
        // const tnx = await web3.eth.sendTransaction({
        //   from: accounts[0],
        //   to: process.env.REACT_APP_OWNER_ADDRESS,
        //   value: amountToPay,
        // });
        // console.log(tnx);
        //if (!tnx) return;
        // return;
        await icoContract
            .deploy({
                data: Ico.bytecode,
                arguments: [
                    gTokenAddr,
                    multiSigAddr,
                    productowner,
                    startTime,
                    endTime,
                    rate.toString(),
                    softCap,
                    hardCap,
                    dexAdd,
                ],
            })
            .send({ from: account })
            .on("error", (err) => {
                console.log(err);
                setGasError(true);
            })
            .then(async (receipt) => {
                let icoAddr = receipt._address;
                const contract = await new web3.eth.Contract(
                    MultiSig.abi,
                    multiSigAddr
                );
                await contract.methods
                    .submitProposal(
                        0,
                        toFixed(values.supply * 1000000000 * 1000000000).toLocaleString(
                            "fullwide",
                            {
                                useGrouping: false,
                            }
                        ),
                        gTokenAddr,
                        icoAddr
                    )
                    .send({
                        from: account,
                        value: web3.utils.toWei(CREATE_PROPOSAL_PAYABLE_VALUE, "ether"),
                    })
                    .on("error", (error) => {
                        console.log(error);
                        setGasError(true);
                    })
                    .then((result) => {
                        console.log(result);
                        setAwaiting(false);
                        localStorage.setItem(`${account}-ico`, icoAddr);
                        addIco(values);
                        props.dispatch(addIcoFormData(values));
                    });

                // await multiSigContract.methods.transferGtoken(tokenAmount, receipt._address)
                // .send({from: account})
                // .on('error', console.log)
                // .then((result) => {
                //   console.log('send token to ico', result);
                // })
            });
    };

    const addIco = (values) => {
        if (props.org && props.org.project && props.org.project.length) {
            const skipFields = [];
            const formData = new FormData();
            formData.append("project_id", props.org.project[0].id);
            const data = {
                ...props.icoFormdata,
                ...values,
            };
            for (const [key, value] of Object.entries(data)) {
                if (!skipFields.includes(key)) {
                    formData.append(key, value);
                }
            }
            const gTokenAddr = localStorage.getItem(`${account}-ico`);
            formData.append("ico_address", gTokenAddr);

            axios
                .post(`${process.env.REACT_APP_API_URL}/add_ico`, formData)
                .then((res) => {
                    console.log(res);
                    axios
                        .post(`${process.env.REACT_APP_API_URL}/add_index/`, {
                            org_id: props.org.org.id,
                            type: "ico_proposal",
                            data: res.data.ico_id,
                        })
                        .then((res) => {
                            props.nextStep();
                        })
                        .catch((err) => {
                            console.log("Index Create Error", err);
                        });
                });
        }
    };

    const handleBlur = (e) => {
        form.setFieldsValue({
            hard_cap: form.getFieldValue('soft_cap') * 2,
            supply: form.getFieldValue('soft_cap') * 2 * form.getFieldValue('offer_price')
        });
    };
    const onFinish = async (values) => {
        props.dispatch(addIcoFormData(values));
        await new Promise((r) => setTimeout(r, 500));
        deploy(values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
    };
    const [form] = Form.useForm();
    return (
        <div>
            <div className=' mb-12 text-center'>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 2
                </h1>
                <p className='text-base'>
                    CREATE Project Subscription
                </p>
            </div>
            <div className='form w-full lg:w-1/2 welcome-card rounded-lg p-6 m-auto'>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'
                    initialValues={{
                        supply: "",
                        start_date: "",
                        end_date: "",
                        offer_price: "",
                        soft_cap: "",
                        hard_cap: "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Start date"
                        name="start_date"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="datetime-local" max={form.getFieldValue('end_date')} />
                    </Form.Item>
                    <Form.Item
                        label="End date"
                        name="end_date"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="datetime-local" min={form.getFieldValue('start_date')} />
                    </Form.Item>
                    <Form.Item
                        label="Offer Price ( Enter tokens per bnb value here )"
                        name="offer_price"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="number" onBlur={(e) =>
                            handleBlur(e)
                        } />
                    </Form.Item>
                    <Form.Item
                        label="Soft Cap"
                        name="soft_cap"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="number" onBlur={(e) =>
                            handleBlur(e)
                        } />
                    </Form.Item>
                    <Form.Item
                        label="Hard Cap"
                        name="hard_cap"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="number" disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="Supply for subscription"
                        name="supply"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input type="number" disabled={true} />
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
                    </div>
                </Form>
            </div>
            <AwaitingApproval open={awaiting} setOpen={setAwaiting} />
            <GasError open={gasError} setOpen={setGasError} />
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        org: state.org,
        icoFormdata: state.icoFormdata,
    };
};

export default connect(mapStateToProps)(IcoStepSecond);