import { Breadcrumb, Space, Table, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// import AddLiquidity from "../../../components/AddLiquidity/AddLiquidity";
import { getOrg } from "../../../services/dashboard";
// import { withRouter } from "react-router";
import axios from "axios";
import { shortAddress } from '../../../helpers';
import MultiSig from "../../../Config/abis/EquinoxMain.json";
import { getWeb3 } from '../../../helpers/currentWalletHelper';
import Web3 from 'web3';

function DashboardHome(props) {
    const { org, auth, history } = props;
    const [eqVaultBalance, setEqVaultBalance] = useState(0);
    const getBalance = async (address) => {
        let web3 = await getWeb3();
        const contract = await new web3.eth.Contract(
            MultiSig.abi,
            address
        );
        const balance = await contract.methods
            .balance()
            .call();
        setEqVaultBalance(balance/Web3.utils.toBN(10 ** 18));
    }
    useEffect(()=>{
        if (org?.org?.multisig_address) {
            getBalance(org.org.multisig_address)
        }
    },[org?.org?.multisig_address])
    useEffect(() => {
        // getIcos();
        if (auth && auth.org_id) getOrg(auth.org_id);
    }, [auth]);
    const createProjectHandler = async (e) => {
        e.preventDefault();
    
        if (auth && auth.org_id) {
          const {
            data: { response: orgData },
          } = await axios.get(
            `${process.env.REACT_APP_API_URL}/get_org/${auth.org_id}`
          );
          console.log(orgData);
          if (orgData) {
            if (orgData?.project && orgData.project.length) {
              alert(
                "Project allready launched please refresh the page to see details of project"
              );
            } else {
              // alert("You can create Project");
              history.push("/dashboard/project/create");
            }
            // console.log(org?.project && org.project.length);
          }
        }
    };
    const transCol = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Recivers',
            dataIndex: 'to_wallet',
            key: 'to_wallet',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            // render: (_, { tags }) => (
            //     <>
            //         {tags.map((tag) => {
            //             let color = tag.length > 5 ? 'geekblue' : 'green';
            //             if (tag === 'loser') {
            //                 color = 'volcano';
            //             }
            //             return (
            //                 <Tag color={color} key={tag}>
            //                     {tag.toUpperCase()}
            //                 </Tag>
            //             );
            //         })}
            //     </>
            // ),
        },
        {
            title: 'Start Date',
            key: 'proposed_date',
            render: (text) => {
                return text?.proposed_date?.substring(0, 10);
            }
        },
        {
            title: 'End Date',
            key: 'finished_date',
            render: (text) => {
                return text?.finished_date?.substring(0, 10);
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (val, record) => {
                return (
                <p className="font-medium text-xs mb-0  text-center">
                    {record.status == 0 ? (
                        <span className="bg-yellow-400 py-1 px-2 text-white font-bold rounded-md">
                        In Progress
                        </span>
                    ) : record.status == 1 ? (
                        <span className="bg-green-400 py-1 px-2 text-white font-bold rounded-md">
                        Completed
                        </span>
                    ) : (
                        <span className="bg-red-400 py-1 px-2 text-white font-bold rounded-md">
                        Failed
                        </span>
                    )}
                </p>
            )
            },
        }
    ];
    const transData = org?.fund_transfer ? org.fund_transfer : [];
    const govCol = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Start Date',
            key: 'start_date',
            render: (text) => {
                return text?.start_date?.substring(0, 10);
            }
        },
        {
            title: 'End Date',
            key: 'end_date',
            render: (text) => {
                return text?.end_date?.substring(0, 10);
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (val, record) => (
                <p className="font-medium text-xs mb-0  text-center">
                    {record.status === "Initialized" ||
                    record.status === "Expired" ? (
                        <span className="bg-yellow-400 py-1 px-2 text-white font-bold rounded-md">
                        In Progress
                        </span>
                    ) : record.status === "Approved" ? (
                        <span className="bg-green-400 py-1 px-2 text-white font-bold rounded-md">
                        Completed
                        </span>
                    ) : (
                        <span className="bg-red-400 py-1 px-2 text-white font-bold rounded-md">
                        Failed
                        </span>
                    )}
                </p>
            ),
        }
    ];
    const govData = org?.proposal && org.proposal.length ? org.proposal.slice(0, 5) : [];
    return (
        <>
            <div className='mb-4'>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a href={() => { }}>Home</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className='font-bold text-pink-500'>Dashboard</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="flex flex-wrap row-minus">
                <div className='flex-none w-5/12 max-lg:w-full px-3'>
                    <div className='welcome-card rounded-lg p-6 mb-6'>
                        <div className='text-sm text-gray-400 mb-3'>
                            USER PROFILE
                        </div>
                        <div className='text-2xl font-bold truncate'>
                            {auth?.member_name} (You)
                        </div>
                        <div className='text-sm flex'>
                            <Typography.Text copyable={{icon: <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 icon icon-tabler icon-tabler-copy" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
                                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
                            </svg>, text: auth?.wallet_address ? auth.wallet_address : ''}} className="flex items-center">{auth?.wallet_address ? shortAddress(auth.wallet_address) : ''}</Typography.Text>
                            
                        </div>
                        <div className='text-sm truncate'>
                            {auth?.email}
                        </div>
                    </div>
                </div>
                <div className='flex-none  max-lg:w-full w-7/12  px-3'>
                    <div className='welcome-card rounded-lg p-6  mb-6'>
                        <div className='text-sm text-gray-400 mb-3'>
                            VAULT OVERVIEW
                        </div>

                        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-6">
                            <div>
                                <div className='text-2xl font-bold'>
                                    EQ Vault
                                </div>
                                <div className='text-sm text-gray-400'>
                                    BNB Chain
                                </div>
                                <div className='text-sm flex'>
                                <Typography.Text copyable={{icon: <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 icon icon-tabler icon-tabler-copy" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
                                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
                                </svg>, text: org?.org?.multisig_address ? org.org.multisig_address : ''}} className="flex items-center">{org?.org?.multisig_address ? shortAddress(org.org.multisig_address) : ''}</Typography.Text>
                                </div>
                            </div>
                            <div>
                                <div className='text-xl font-bold text-green-500'>
                                    {eqVaultBalance}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    {eqVaultBalance} BNB value
                                </div>
                                <div className='text-sm'>
                                    Total Value
                                </div>
                            </div>
                            <div>
                                <Link to={'/dashboard/assets?createReq=1'}>
                                    <div className='text-xl font-bold cursor-pointer'>
                                        Send
                                    </div>
                                </Link>
                                <div className='text-sm text-gray-400'>
                                    Initiate Transaction
                                </div>
                                <div className='text-sm'>
                                    BEP20 Tokens Only
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex-none max-lg:w-full w-5/12 px-3'>
                    <div className='welcome-card rounded-lg p-6 mb-6'>
                        <div className='text-sm text-gray-400 mb-3'>
                            PROJECT OVERVIEW
                        </div>
                        <div className="flex gap-3 row-minus mb-6">
                            <div className='w-3/5 px-3  mb-6'>
                                <div className='text-2xl font-bold'>
                                    {org?.project && org.project.length ? org.project[0]?.project_name : '---'}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    {org?.project && org.project.length ? org.project[0]?.project_email : ''}
                                </div>
                                {/* <div className='text-sm'>
                                    Name
                                </div> */}
                            </div>
                            <div className='w-2/5 px-3 mb-6'>
                                {/* <div className='font-bold'>
                                    ----
                                </div> */}
                                <div className='text-sm text-gray-400'>
                                    Token Name
                                </div>
                                <div className='text-sm'>
                                {org?.project && org.project.length ? org.project[0]?.token_name : ''}  
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 row-minus mb-3">
                            <div className='w-3/5 px-3  mb-6'>
                                <div className='text-2xl font-bold'>
                                    {org?.project && org.project.length ? shortAddress(org.project[0]?.gtoken_address) : ''}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    BNB Chain
                                </div>
                                <div className='text-sm'>
                                    Token Contract
                                </div>
                            </div>
                            <div className='w-2/5 px-3 mb-6'>
                                <div className='font-bold'>
                                    {org?.project && org.project.length ? shortAddress(org.project[0]?.fixed_supply) : ''}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    Fixed
                                </div>
                                <div className='text-sm'>
                                    Token Supply
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 row-minus mb-6">
                            <div className='w-full px-3  mb-6'>
                                {org?.project && org.project.length ? org.project[0]?.project_description : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex-none max-lg:w-full w-7/12 px-3'>
                    <div className='flex flex-wrap row-minus'>
                        <div className='w-3/5 px-3 max-sm:w-full mb-6'>
                            <div className='welcome-card rounded-lg p-6 mb-6'>
                                <div className='text-sm text-gray-400 mb-3'>
                                    SUBSCRIPTION OVERVIEW
                                </div>
                                <div className="flex gap-3 row-minus mb-6">
                                    <div className='w-3/5 px-3  mb-6'>
                                        <div className='text-2xl font-bold'>
                                            {org?.ico && org.ico.length ? org.ico[0]?.project_id : ''}
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            {org?.ico && org.ico.length ? org.ico[0]?.start_date : ''} - {org?.ico && org.ico.length ? org.ico[0]?.end_date : ''}
                                        </div>
                                        {/* <div className='text-sm'>
                                            Name
                                        </div> */}
                                    </div>
                                    <div className='w-2/5 px-3 mb-6'>
                                        <div className='font-bold'>
                                            ----
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            BEP20
                                        </div>
                                        <div className='text-sm'>
                                            Total Value
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 row-minus mb-3">
                                    <div className='w-3/5 px-3  mb-6'>
                                        <div className='text-2xl font-bold truncate'>
                                            {org?.ico && org.ico.length ? shortAddress(org.ico[0]?.ico_address) : ''}
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            BNB Chain
                                        </div>
                                        <div className='text-sm'>
                                            Token Contract
                                        </div>
                                    </div>
                                    <div className='w-2/5 px-3 mb-6'>
                                        <div className='font-bold'>
                                            {org?.ico && org.ico.length ? org.ico[0]?.supply : ''}
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            Fixed
                                        </div>
                                        <div className='text-sm'>
                                            Token Supply
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="flex gap-3 row-minus mb-6">
                                    <div className='w-3/5 px-3  mb-6'>
                                        <div className='text-2xl font-bold'>
                                            Send
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            30.02.2023
                                        </div>
                                        <div className='text-sm'>
                                            Name
                                        </div>
                                    </div>
                                    <div className='w-2/5 px-3 mb-6'>
                                        <div className='font-bold'>
                                            100 million
                                        </div>
                                        <div className='text-sm text-gray-400'>
                                            Fixed
                                        </div>
                                        <div className='text-sm'>
                                            Token supply
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className='w-2/5 max-sm:w-full px-3  mb-6'>
                            <div className='welcome-card rounded-lg p-6 mb-8'>
                                <div className='text-sm text-gray-400'>
                                    Members <br/>Overview
                                </div>
                                <div className='text-2xl font-bold text-yellow-500'>
                                    {org?.members ? org.members.filter(m=>m.is_active===1).length : 0}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    Active
                                </div>
                                <div className='text-sm'>
                                    Total Members
                                </div>
                            </div>
                            <div className='welcome-card rounded-lg p-6 mb-6'>
                                <div className='text-sm text-gray-400'>
                                    Recent<br/> Notification
                                </div>
                                <div className='text-2xl font-bold text-blue-700'>
                                    0
                                </div>
                                {/* <div className='text-sm text-gray-400'>
                                    Active
                                </div>
                                <div className='text-sm'>
                                    Total Members
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* <div className='mb-6'>
                <div className="grid grid-cols-2 max-lg:grid-cols-2 gap-6">
                    <div className='p-6 welcome-card rounded-lg'>
                        <h1 className='font-bold text-pink-500 text-xl mb-2'>
                            EQ Vault
                        </h1>
                        <p className='mb-6'>
                            0xE0c1603aa4A370b551492e89139c0408b87C374c
                        </p>
                        <div className='net-bg-opacity mb-8 backdrop-opacity-5 p-3 rounded-lg '>
                            <div className='mb-1 text-sm text-gray-400'>Network</div>
                            <div className='font-bold'>Binance SmartChain(BEP20)</div>
                        </div>
                        <div className='text-sm text-gray-400'>
                            ( Note: Always use BEP20 network to send and receive assets on EQ Vault)
                        </div>
                    </div>
                    <div className='p-6 welcome-card rounded-lg'>
                        <h1 className='font-bold text-pink-500 text-xl mb-2'>
                            EQ Network
                        </h1>
                        <p className='mb-6'>
                            An integrated ecosystem of interoperable blockchain and natively developed smart contract protocols to collectively own/mint/manage Cryptos & NFTs in Decentralised Vaults, to tokenize projects using tokens/nfts, offer subscription with tokens/nfts, share yield with subscribers, to collectively create LPs on Popular DEXs and to access DeFi right from the Decentralised Vaults.<br />
                            <span className='text-pink-500 font-bold'>
                                info@eqnetwork.io
                            </span>
                        </p>
                    </div>
                </div>
            </div> */}
            <div className='mb-8'>
                <div className='text-base font-bold mb-3'>
                    Recent Transaction requests
                </div>
                <div>
                    <Table pagination={false} columns={transCol} dataSource={transData} />
                </div>
            </div>
            <div>
                <div className='text-base font-bold mb-3'>
                    Governance proposals
                </div>
                <div>
                    <Table pagination={false} columns={govCol} dataSource={govData} />
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
      org: state.org,
      auth: state.auth,
    };
  };
  
  export default connect(mapStateToProps)(DashboardHome);