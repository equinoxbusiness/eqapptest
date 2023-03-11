import { Breadcrumb, Button, Form, Input, message, Modal, Select, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CompleteRequest from './asset-tab-content/CompleteRequest';
import Overview from './asset-tab-content/Overview';
import SubscriptionCompleteRequest from './asset-tab-content/SubscriptionCompleteRequest';
import SubscriptionPendingRequest from './asset-tab-content/SubscriptionPendingRequest';
import PendingRequest from './asset-tab-content/PendingRequest';
import { connect } from 'react-redux';
import { getWeb3 } from "../../../helpers/currentWalletHelper";
import minABI from "../../../Config/abis/BalanceOf.json";
import MultiSig from "../../../Config/abis/EquinoxMain.json";
import store from "../../../redux/store";
import { updateSpinner } from "../../../redux/actions";
import { toFixed } from "../../../helpers/numberFormatter";
import axios from "axios";
import { getOrg } from "../../../services/dashboard";
import { GasError } from "../../../components/modals";
import Spinner from "../../../components/Spinner/Spinner";

// TOKEN CONTRACTS START
import BNBContract from "../../../Config/abis2/BNB.json";

import BUSDContract from "../../../Config/abis2/BUSD.json";

import ETHContract from "../../../Config/abis2/ETH.json";

import USDTContract from "../../../Config/abis2/USDT.json";
import {
    // CREATE_ASSETS_PROPOSAL,
    CREATE_PROPOSAL_PAYABLE_VALUE,
} from "../../../utils";
//TOKEN CONTRACTS END

function Assets(props) {
    const [searchParams] = useSearchParams();
    const createReq = searchParams.get('createReq');
    const onFinish = async (values) => {
        console.log('Success:', values);
        await new Promise((r) => setTimeout(r, 500));
        deploy(values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    useEffect(()=>{
        console.log(createReq, '----r----')
        setModal2Open(createReq)
    }, [createReq])
    const { org, auth, history } = props;
    const [form] = Form.useForm();
    const { Option } = Select;
    const [balance, setBalance] = useState(0);
    const [spinner, setSpinner] = useState(false);
    const [gasError, setGasError] = useState(false);
    const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
    const options = [
        {
            id: "gtoken",
            name: `${org?.project[0]?.token_name
                    ? org?.project[0]?.token_name
                    : "Gtoken (Not Created yet)"
                }`,
            address: org?.project[0]?.gtoken_address,
        },
        {
            id: "BNB",
            name: `BNB`,
            address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        },
        {
            id: "BUSD",
            name: `BUSD`,
            address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        },
        {
            id: "ETH",
            name: "ETH",
            address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        },
        {
            id: "USDT",
            name: `USDT`,
            address: "0x55d398326f99059ff775485246999027b3197955",
        },
    ];
    const gTokenAddr = org?.project[0]?.gtoken_address;

    const setTokenBalance = async (abi, address, value) => {
        const web3 = await getWeb3();
        // let accounts = await web3.eth.getAccounts();
        // let account = accounts[0];
        const multiSigAddr = org?.org?.multisig_address;
        const contract = new web3.eth.Contract(abi, address);
        if (contract) {
            const _balance = await contract.methods.balanceOf(multiSigAddr).call();
            const _acctualBal = web3.utils.fromWei(`${_balance}`, "ether");
            console.log("CURRENT TOKEN BALANCE", _acctualBal);
            setCurrentTokenBalance(+_acctualBal);

            // console.log(_balance);
        }
    };

    const handleChange = async (value) => {
        if (value === "gtoken") {
            if (!gTokenAddr) {
                alert("Please select a valid token");
                return;
            }
            form.setFieldValue("asset", value);
            await setTokenBalance(minABI.abi, gTokenAddr, value);
            // console.log()
        } else if (value === "BNB") {
            form.setFieldValue("asset", value);
            await setTokenBalance(BNBContract.abi, BNBContract.address, value);
        } else if (value === "BUSD") {
            form.setFieldValue("asset", value);
            await setTokenBalance(BUSDContract.abi, BUSDContract.address, value);
        } else if (value === "ETH") {
            form.setFieldValue("asset", value);
            await setTokenBalance(ETHContract.abi, ETHContract.address, value);
        } else if (value === "USDT") {
            form.setFieldValue("asset", value);
            await setTokenBalance(USDTContract.abi, USDTContract.address, value);
        }

        let res;
        // if (e.target.value === "BNB") {
        //   res = await getTokenBalance(
        //     e.target.value.toLowerCase(),
        //     org?.org?.multisig_address
        //   );
        // }
        console.log(res);
        // setBalance(res);
    };

    const limitMaxvalue = (e, values) => {
        var currentValue = String.fromCharCode(e.which);
        const val = e.target.value + currentValue;
        console.log(val);
        // if (balance <= parseFloat(val)) {
        //   e.preventDefault();
        // }
    };

    const deploy = async (values) => {
        // setSpinner(true);

        const web3 = await getWeb3();
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        const multiSigAddr = org?.org?.multisig_address;
        const gTokenAddr = org?.project[0]?.gtoken_address;
        const contract = await new web3.eth.Contract(MultiSig.abi, multiSigAddr);
        const tokenName = values.asset;
        console.log(values.asset);
        if (values.asset === "gtoken") {
            if (!gTokenAddr) {
                alert("Please select a valid token");
                return;
            }
        }
        const selectedToken = options.find((val) => val.id === tokenName);
        console.log(selectedToken);
        // return;

        // console.log(org, org?.org?.id, org.org.multisig_address, auth);

        // if (selectedToken)
        // return;

        // const tokenAddress = org.project[0].gtoken_address;
        // let ETHContract = new web3.eth.Contract(minABI.abi, tokenAddress);
        // let ETHbalance = await ETHContract.methods.balanceOf(multiSigAddr).call();
        // // console.log();
        // const tokenBalance = ETHbalance / 1000000000;
        // @ts-ignore
        // console.log(
        //   toFixed(values.quantity * 1000000000).toLocaleString("fullwide", {
        //     useGrouping: false,
        //   }),
        //   await getAddress(contracts[tokenName])
        // );

        console.log(values);
        store.dispatch(updateSpinner(true));
        // return;
        if (currentTokenBalance > values.quantity) {
            //   const amountToPay = Web3.utils.toWei(
            //     `${CREATE_ASSETS_PROPOSAL}`,
            //     "ether"
            //   );
            //   let accounts = await web3.eth.getAccounts();
            //   const tnx = await web3.eth.sendTransaction({
            //     from: accounts[0],
            //     to: process.env.REACT_APP_OWNER_ADDRESS,
            //     value: amountToPay,
            //   });
            //   console.log(tnx);
            //   if (!tnx) return;
            await contract.methods
                .submitTransferProposal(
                    toFixed(values.quantity * 1000000000 * 1000000000).toLocaleString(
                        "fullwide",
                        {
                            useGrouping: false,
                        }
                    ),
                    selectedToken.address,
                    values.receiver_wallet
                )
                .send({
                    from: account,
                    value: web3.utils.toWei(CREATE_PROPOSAL_PAYABLE_VALUE, "ether"),
                })
                .on("error", (error) => {
                    console.log(error);
                    setGasError(true);
                    store.dispatch(updateSpinner(false));
                })
                .then((result) => {
                    console.log(result);
                    const formData = new FormData();
                    formData.append("org_id", org?.org?.id);
                    formData.append("from_wallet", multiSigAddr);
                    formData.append("to_wallet", values.receiver_wallet);
                    formData.append("amount", values.quantity);
                    formData.append("description", values.description);
                    axios
                        .post(
                            `${process.env.REACT_APP_API_URL}/init_fund_transfer`,
                            formData
                        )
                        .then(async (res) => {
                            console.log(res.data.status);
                            if (res.data.status === "error") {
                                message.error(res.data.message);
                            } else {
                                await axios.post(
                                    `${process.env.REACT_APP_API_URL}/add_index/`,
                                    {
                                        org_id: props.org.org.id,
                                        type: "transfer_proposal",
                                        data: res.data.id,
                                    }
                                );
                                console.log("respose", res);
                                console.log("ID", res.data.id);
                                // toast.success(res.data.message);
                                history.push("/dashboard/assets");
                            }
                            if (auth && auth.org_id) getOrg(auth.org_id);
                        });
                    store.dispatch(updateSpinner(false));
                    setSpinner(false);
                    message.success("Proposal Submitted Successfully");
                });
        } else {
            store.dispatch(updateSpinner(false));
            alert("You dont have sufficient Balance");
        }
    };
    const [modal2Open, setModal2Open] = useState(false);
    const items = [
        {
            key: '1',
            label: `Overview`,
            children: <Overview setModal2Open={setModal2Open}/>,
        },
        {
            key: '2',
            label: `Subscription Completed Request`,
            children: <SubscriptionCompleteRequest />,
        },
        {
            key: '3',
            label: `Subscription Pending Request`,
            children: <SubscriptionPendingRequest />,
        },
        {
            key: '4',
            label: `Completed Request`,
            children: <CompleteRequest />,
        },
        {
            key: '5',
            label: `Pending Request`,
            children: <PendingRequest />,
        },
        {
            key: '6',
            label: `Failed Request`,
            children: `Content of Tab Pane 3`,
        },
    ];
    return (
        <div>
            <div className=''>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to='/dashboard/home'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className='text-pink-500 font-bold'>Assets</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className='mb-4'>
                <Tabs items={items} />
            </div>
            <div className='flex gap-3'>
                <div>
                    <Button onClick={() => setModal2Open(true)} type='primary' className='grad-btn border-0'>Create New Request</Button>
                </div>
                <div>
                </div>
            </div>

            <Modal
                centered
                open={modal2Open}
                footer={null}
                onOk={() => setModal2Open(false)}
                onCancel={() => setModal2Open(false)}
            >
                <div className='mt-6'>
                    <div className='text-center'>
                        <div className='text-xl font-bold mb-3'>
                            Create Request
                        </div>
                        <p className='mb-6'>
                            Create rquest to initiating an instance for sending crypto assets to receiver wallet. it must be approved by all members within 7days of initiation for sucessfull transaction
                        </p>
                    </div>
                    <div>
                        <Form
                            name="basic"
                            layout='vertical'
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            initialValues={{
                                receiver_wallet: "",
                                asset: "",
                                quantity: 0,
                                description: "",
                            }}
                            autoComplete="off"
                            form={form}
                        >
                            <Form.Item
                                label="Receiver wallet"
                                name="receiver_wallet"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Required'
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Asset"
                                name="asset"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Select
                                    onChange={(e) => handleChange(e)}
                                >
                                    {options.map(o=>{
                                        return <Option key={o.id} value={o.id}>{o.name}</Option>
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Quantity"
                                name="quantity"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item className='text-center'>
                                <Button type="primary" htmlType="submit" className='grad-btn border-0'>
                                    Initiate
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Modal>
            {spinner && <Spinner />}
            <GasError open={gasError} setOpen={setGasError} />
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        org: state.org,
        auth: state.auth,
    };
};

export default connect(mapStateToProps)(Assets);