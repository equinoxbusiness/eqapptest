import { Button, message, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ETHEREUMM from "../../../../assets/images/ETH.png";
import USDTT from "../../../../assets/images/USDT.png";
import BNBB from "../../../../assets/images/BNB.png";
import BUSDD from "../../../../assets/images/BUSD.png";
import BTCC from "../../../../assets/images/btc.svg";
import { getWeb3 } from "../../../../helpers/currentWalletHelper";
import Web3 from "web3";
import minABI from "./../../../../Config/abis/BalanceOf.json";
import equinoxIcoAbi from "../../../../Config/abis/subscriptionMain.json";
// TOKEN CONTRACTS START
import BNBContract from "../../../../Config/abis2/BNB.json";

import BUSDContract from "../../../../Config/abis2/BUSD.json";

import ETHContract from "../../../../Config/abis2/ETH.json";

import USDTContract from "../../../../Config/abis2/USDT.json";
import { getTokenBalance } from "../../../../helpers/getterFunctions";

function Overview(props) {
    const { org, auth, setModal2Open } = props;
    const [available, setAvailable] = useState(0);
    const [ICOAvailable, setICOAvailable] = useState(0);
    const [icoDetails, setIcoDetails] = useState([]);
    const [icoBalance, setIcoBalance] = useState(0);
    const [BNBbalance, setBNBbalance] = useState(0);
    const [EQXBalance, setEQXBalance] = useState(0);
    const [ICOBNBbalance, setICOBNBbalance] = useState(0);
      //TOKENBALANCE STATS
    const [bnbBalance, setBnbBalance] = useState(0);
    const [busdBalance, setBusdBalance] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);
    const [usdtBalance, setUsdtBalance] = useState(0);
    const availTokens = [
        // {
        //   token: "USDT",
        // },
        {
        token: "BNB",
        },
        // {
        //   token: "BTC",
        // },
        // {
        //   token: "ETH",
        // },
        // {
        //   token: "BUSD",
        // },
    ];
    const allTokens = [
        {
          token: "USDT",
          image: USDTT,
          balance: usdtBalance,
        },
        {
          token: "BNB",
          image: BNBB,
    
          balance: bnbBalance,
        },
        {
          token: "ETH",
          image: ETHEREUMM,
    
          balance: ethBalance,
        },
        {
          token: "BUSD",
          image: BUSDD,
    
          balance: busdBalance,
        },
        {
          token: "BTC",
          image: BTCC,
    
          balance: busdBalance,
        },
    ];
    const convertPrice = (price) => {
        const convertedprice = new Intl.NumberFormat("en-GB", {
          // notation: "compact",
          compactDisplay: "short",
        }).format(price);
        return convertedprice;
    };
    useEffect(() => {
        console.log("inside useeffect");
        if (org) {
          getBalance();
          getICOBalance();
          getIcoDetails();
          getAssets1Balance();
        }
    }, [org]);
    useEffect(() => {
        const getIcoBalance = async () => {
          if (org && org?.ico?.length > 0) {
            let web3 = await getWeb3();
            const balance = await web3.eth.getBalance(
              org.ico[org?.ico.length - 1].ico_address
            );
            const convertedBalance = web3.utils.fromWei(balance, "ether");
            setIcoBalance(convertedBalance);
          }
        };
        getIcoBalance();
      }, []);
    const getBalance = async () => {
        org &&
          org.project &&
          org.project.length &&
          org.project.forEach(async (pro) => {
            let web3 = await getWeb3();
            let BNBbalance = await web3.eth.getBalance(pro.gtoken_address);
            console.log(BNBbalance / 1000000000000000000);
            setBNBbalance(Number(Web3.utils.fromWei(BNBbalance, "ether")));
            const tokenAddress = org.project[0].gtoken_address;
            let ETHContract = new web3.eth.Contract(minABI.abi, tokenAddress);
            let multiSigAddr = org?.org?.multisig_address;
            let ETHbalance = await ETHContract.methods
              .balanceOf(multiSigAddr)
              .call();
            setAvailable(Number(Web3.utils.fromWei(ETHbalance, "ether")));
            let EQXContract = new web3.eth.Contract(
              minABI.abi,
              "0x54040960e09fb9F1DD533d4465505Ba558693Ad6"
            );
            let EQXbalance = await EQXContract.methods
              .balanceOf(multiSigAddr)
              .call();
            setEQXBalance(Number(Web3.utils.fromWei(EQXbalance, "ether")));
          });
    };
    const getICOBalance = async () => {
        org &&
          org.ico &&
          org.ico.length &&
          org.ico.forEach(async (pro) => {
            let web3 = await getWeb3();
            let BNBbalance = await web3.eth.getBalance(pro.ico_address);
            console.log(BNBbalance / 1000000000000000000);
            setICOBNBbalance(BNBbalance / 1000000000000000000);
            const tokenAddress = org.project[0].gtoken_address;
            let ETHContract = new web3.eth.Contract(minABI.abi, tokenAddress);
            let ETHbalance = await ETHContract.methods
              .balanceOf(pro.ico_address)
              .call();
            setICOAvailable(ETHbalance / 1000000000);
          });
    };
    const getIcoDetails = async () => {
        if (org && org.ico && org.ico.length && org.ico[0].ico_address) {
          Promise.all(
            availTokens.map(async (val) => {
              val.balance = await getTokenBalances(
                val.token,
                org.ico[0].ico_address
              );
              return val;
            })
          ).then((res) => {
            setIcoDetails(res);
          });
        }
      };
      const getAssets1Balance = async () => {
        let multiSigAddr = org?.org?.multisig_address;
        let web3 = await getWeb3();
        // let accounts = await web3.eth.getAccounts();
        // let account = accounts[0];
        console.log(multiSigAddr);
        //BNB
        const bnbContract = new web3.eth.Contract(BNBContract.abi, BNBContract.address);
        if (bnbContract) {
          const balance = await bnbContract.methods.balanceOf(multiSigAddr).call();
          // console.log("BNB BALANCE", Web3.utils.fromWei(balance, "ether"));
          setBnbBalance(+Web3.utils.fromWei(balance, "ether"));
        }
        //BUSD
        const busdContract = new web3.eth.Contract(BUSDContract.abi, BUSDContract.address);
        if (busdContract) {
          const balance = await busdContract.methods.balanceOf(multiSigAddr).call();
          // console.log("BUSD BALANCE", Web3.utils.fromWei(balance, "ether"));
          setBusdBalance(+Web3.utils.fromWei(balance, "ether"));
        }
        //ETH
        const ethContract = new web3.eth.Contract(ETHContract.abi, ETHContract.address);
        if (ethContract) {
          const balance = await ethContract.methods.balanceOf(multiSigAddr).call();
          // console.log("ETH BALANCE", Web3.utils.fromWei(balance, "ether"));
          setEthBalance(+Web3.utils.fromWei(balance, "ether"));
        }
        //USDT
        const usdtContract = new web3.eth.Contract(USDTContract.abi, USDTContract.address);
        if (usdtContract) {
          const balance = await usdtContract.methods.balanceOf(multiSigAddr).call();
          // console.log("USDT BALANCE", Web3.utils.fromWei(balance, "ether"));
          setUsdtBalance(+Web3.utils.fromWei(balance, "ether"));
        }
      };
      const getTokenBalances = async (token, wallet) => {
        console.log();
        try {
          let res;
          if (token) {
            if (wallet) {
              res = await getTokenBalance(token.toLowerCase(), wallet);
            }
            // console.log()
            return res;
          }
        } catch (e) {
          console.log(e);
        }
      };
    const endSale = async () => {
        let web3 = await getWeb3();
        const address = org.ico[org?.ico.length - 1].ico_address;
    
        let eqxContract = new web3.eth.Contract(equinoxIcoAbi.abi, address);
        console.log(eqxContract);
        let accounts = await web3.eth.getAccounts();
        if (eqxContract) {
          // const balance = await web3.eth.getBalance(address);
          // const convertedBalance = web3.utils.fromWei(`${balance}`, "ether");
          // const amountToPay = web3.utils.toWei(
          //   (Number(convertedBalance) * 3.2) / 100,
          //   "ether"
          // );
    
          // const tnx = await web3.eth.sendTransaction({
          //   from: accounts[0],
          //   to: process.env.REACT_APP_OWNER_ADDRESS,
          //   value: amountToPay,
          // });
          // console.log(tnx);
          // if (!tnx) return;
    
          await eqxContract.methods
            .end()
            .send({ from: accounts[0] })
            .on("error", (error) => console.log(error))
            .then((result) => {
              message.success("Transaction successful");
            });
        }
    };
    const withdrawLocked = async () => {
        let web3 = await getWeb3();
        const address = org.ico[org?.ico.length - 1].ico_address;
    
        let eqxContract = new web3.eth.Contract(equinoxIcoAbi.abi, address);
        console.log(eqxContract);
        let accounts = await web3.eth.getAccounts();
        if (eqxContract) {
          // const balance = await web3.eth.getBalance(address);
          // const convertedBalance = web3.utils.fromWei(`${balance}`, "ether");
          // const amountToPay = web3.utils.toWei(
          //   (Number(convertedBalance) * 3.2) / 100,
          //   "ether"
          // );
    
          // const tnx = await web3.eth.sendTransaction({
          //   from: accounts[0],
          //   to: process.env.REACT_APP_OWNER_ADDRESS,
          //   value: amountToPay,
          // });
          // console.log(tnx);
          // if (!tnx) return;
    
          await eqxContract.methods
            .withdrawLockedFundsIfICOFailed()
            .send({ from: accounts[0] })
            .on("error", (error) => console.log(error))
            .then((result) => {
              message.success("Transaction successful");
            });
        }
    };
    return (
        <div>
            <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">
                <div>
                    {org &&
                      org.project &&
                      org.project.length &&
                      org.project.map((pro) => {
                        return (
                            <div className='welcome-card rounded-lg p-6 mb-6' key={pro.id}>
                                <div className='text-sm text-gray-400 mb-3'>
                                    {pro.project_name}
                                </div>
                                <div className='text-xl text-gray-900 font-bold truncate mb-3'>
                                    {pro.gtoken_address}
                                </div>
                                <div className='flex gap-6 mb-3 font-bold'>
                                    <div className='text-sm text-gray-400'>
                                        Total Supply
                                        <div className='text-xl text-gray-600'>
                                        {convertPrice(pro.fixed_supply)}
                                        </div>
                                    </div>
                                    <div className='text-sm text-gray-400'>
                                        Available
                                        <div className='text-xl text-gray-600'>
                                            {convertPrice(available)}
                                        </div>
                                    </div>
                                </div>
                                <div className=''>
                                    <Link to='/dashboard/assets/createico'>
                                      <Button type='primary' className='grad-btn border-0'>Create manage Subscription</Button>
                                    </Link>
                                    <div className="grid grid-flow-col gap-2 mt-3 ">
                                      <Tooltip
                                        title=" Claim Raised BNB and Unsold tokens from Subscription."
                                        placement="top"
                                      >
                                        <Button type='primary' className='grad-btn border-0'
                                          onClick={endSale}
                                        >
                                          End Sale
                                        </Button>
                                      </Tooltip>

                                    
                                      <>
                                      <Tooltip
                                        title="Withdraw Tokens from Subscription if Subscription gets failed"
                                        placement="top"
                                      >
                                        <Button type='primary' className='grad-btn border-0'
                                          onClick={withdrawLocked}
                                        >
                                          Withdraw Tokens
                                        </Button>
                                        </Tooltip>
                                      </>
                                    </div>
                                </div>
                            </div>
                        )}
                    )}
                    <div className='welcome-card rounded-lg p-6 mb-3'>
                        <div className='text-sm text-gray-400 mb-2'>
                        Project Subscription Contribution
                        </div>
                        <div className='text-xl text-gray-700 font-bold truncate'>
                            {convertPrice(ICOAvailable / 1000000000)}{" "}
                            {org &&
                              org.project &&
                              org.project.length &&
                              org.project[0].token_ticker}{" "}
                        </div>
                    </div>
                    {icoDetails &&
                        icoDetails.map((ico) => {
                          return (
                            <div className='welcome-card rounded-lg p-6 mb-3 flex justify-between' key={ico.token}>
                                <div className='text-sm text-gray-700'>
                                {ico.token}
                                </div>
                                <div className='text-xl text-gray-700 font-bold truncate'>
                                {icoBalance}
                                </div>
                            </div>
                          );
                    })}
                </div>
                <div>
                    <div className='welcome-card rounded-lg p-6 mb-3'>
                        <div className='text-sm text-gray-400 mb-2'>
                            Crypto asset value
                        </div>
                        <div className='text-xl text-gray-700 font-bold truncate'>
                            {convertPrice(available)}{" "}
                            {org &&
                              org.project &&
                              org.project.length &&
                              org.project[0].token_ticker}{" "}
                        </div>
                    </div>
                    {allTokens &&
                        allTokens.map((token) => {
                          return (
                            <div className='welcome-card rounded-lg p-6 mb-3 flex justify-between' key={token.token}>
                                <div className='text-sm text-gray-700 flex items-center'>
                                    <img src={token.image} alt='' className='w-[2rem] mr-2'/>
                                    {token.token}
                                </div>
                                <div className='text-xl text-gray-700 font-bold truncate'>
                                    {token.balance}
                                </div>
                                <div className='text-sm text-pink-500 font-bold truncate cursor-pointer' onClick={()=>setModal2Open(true)}>
                                    Send
                                </div>
                            </div>
                            );
                        })
                    }
                    <Tooltip
                      title=" This feature is coming soon."
                      placement="top"
                    >
                      <Button type='primary' className='grad-btn border-0' onClick={() => message("This feature is coming soon!")}>Import Token</Button>
                    </Tooltip>
                </div>
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
  
  export default connect(mapStateToProps)(Overview);