import { Breadcrumb, Button, Form, Input, Select } from 'antd';
import { Fragment, useRef, useState } from "react";
import { data } from "../../assets/data";
import { CaretDownOutlined, UserOutlined } from "@ant-design/icons";

import ImgBNB from "../../assets/images/bnb.svg";
import ImgBTC from "../../assets/images/btc.svg";
import ImgBUSD from "../../assets/images/busd.svg";
import ImgETH from "../../assets/images/eth.svg";
import ImgUSDT from "../../assets/images/usdt.svg";
import Image from "../../assets/images/equinox_logo.png";

import React, { useEffect, useCallback } from "react";

import {
    checkIfApproved,
    getTokenBalance,
    getEquivalentToken,
    getCurrId,
    generateRefLink,
    getCurrPrice,
    getEQXBalance,
    getCorrespondingEQX,
} from "./../../helpers/getterFunctions";
import { connect } from "react-redux";
import { approveTokens, buyToken } from "./../../helpers/setterFunctions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { convertToInternationalCurrencySystem } from "./../../helpers/numberFormatter";

import SwiperCore, { Autoplay, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import detectEthereumProvider from "@metamask/detect-provider";
import { accountUpdate } from "../../redux/actions";
import { getIcos } from "../../services/dashboard";
import { getWeb3 } from "../../helpers/currentWalletHelper";
import Ico from "../../Config/abis/subscriptionMain.json";
import { getAddress } from "../../helpers//addressHelper";
import IUniswapV2Router02 from "../../Config/abis/IUniswapV2Router02.json";
import contracts from "../../Config/contracts";

SwiperCore.use([Autoplay, Navigation]);

function initWeb3(provider) {
    const web3 = new Web3(provider);

    web3.eth.extend({
        methods: [
            {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: web3.utils.hexToNumber,
            },
        ],
    });

    return web3;
}

function PlaySubscription(props) {
    const { ico } = props;
    // console.log("ICO:", ico);
    useEffect(() => {
        getIcos();
        document.body.classList.add("buy-icos-root");
        return () => {
            document.body.classList.remove("buy-icos-root");
        };
    }, []);

    const [dialogueBox1, setDialogueBox1] = useState(false);
    const [dialogueBox2, setDialogueBox2] = useState(false);
    const [query, setQuery] = useState("USDT");
    const [icotoken, setIcotoken] = useState("");
    const referInput = useRef(null);
    const [isBuy, setBuy] = useState(true);

    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [buttonName, setButtonName] = useState("BUY");
    const [currTokenBal, setCurTokenBal] = useState("");
    const [refLink, setRefLink] = useState("");
    const [ref, setRef] = useState("10000");
    const [transactionOnGoing, setTransactionOnGoing] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");
    const [price, setPrice] = useState("");
    const [eqxBalance, setEqxBalance] = useState("");
    const [wrongNetwork, setWrongNetwork] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);

    let web3Modal = null;
    let web3 = null;
    let provider = null;

    useEffect(() => {
        if (ico && ico.length > 0) {
            const selectedIco = ico.filter(
                (ico) => ico.finalized === 1 && ico.reached === 0
            );
            console.log(selectedIco);
            setIcotoken(selectedIco[0]?.ico_address);
        }
    }, [ico]);
    // to initilize the web3Modal

    const init = async () => {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: "c3f6ce1953e4470191a8d12b8ba92672",
                    rpcUrl: process.env.REACT_APP_RPC_URL,
                },
            },
        };

        web3Modal = new Web3Modal({
            network: process.env.REACT_APP_NETWORK,
            cacheProvider: false,
            providerOptions: providerOptions,
        });
        provider = await detectEthereumProvider();
    };

    init();

    useEffect(() => {
        (async () => {
            try {
                // await reset()
                await getBalance();
            } catch (e) {
                console.log(e);
            }
        })();

        // getCorrespondingEQX("100","eth")
    }, [query]);

    useEffect(() => {
        (async () => {
            try {
                // await reset()
                await getBalance();
            } catch (e) {
                console.log(e);
            }
        })();
    }, [props.account]);

    useEffect(() => {
        (async () => {
            try {
                const queryParams = new URLSearchParams(window.location.search);
                const id = queryParams.get("id");
                let currId = await getCurrId();
                let price = await getCurrPrice();
                setPrice(price);
                // console.log("id----------->", id);
                if (Number(currId) >= Number(id) && Number(id) > 10000) {
                    // console.log("here I am");
                    localStorage.setItem("ref", id);
                    setRef(id);
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }, [props.account?.account]);

    useEffect(() => {
        (async () => {
            try {
                if (props.account && props.account.account) {
                    let link = await generateRefLink(
                        `${window.location.origin.toString()}/buy-eqx/?id=`,
                        props.account.account
                    );
                    // console.log("ref------>", link);
                    setRefLink(link);
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }, [props.account?.account]);

    useEffect(() => {
        (async () => {
            try {
                if (!query) return;
                if (query === "BNB") setButtonName("BUY EQX");
                else {
                    let res = await checkAllowance();
                    // console.log("res--------->", res);
                    if (res === true) setButtonName("BUY EQX");
                    else setButtonName("BUY");
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }, [query, props.account, inputAmount, transactionOnGoing]);

    const handleOutputChange = useCallback(
        async (e) => {
            try {
                e.preventDefault();
                e.persist();
                setOutputAmount(e.target.value);
                // console.log("heeeee--------");
                if (query) {
                    let _input = await getCorrespondingEQX(
                        e.target.value,
                        query.toLowerCase()
                    );
                    setInputAmount(_input);
                }
            } catch (e) {
                console.log(e);
            }
        },
        [query]
    );

    // useEffect(() => {
    //   reset()
    // }, [query])

    const handleSelect = useCallback(
        async (e) => {
            e.preventDefault();
            e.persist();
            try {
                // console.log("selected value is -----", e);
                // setValue(e);

                setQuery(e.target.value);
                // console.log("value is ------", e.target.value);
                // await reset()
                if (inputAmount) {
                    // console.log("false-----");

                    let _outputAmount = await getEquivalentToken(
                        inputAmount,
                        e.target.value.toLowerCase()
                    );
                    setOutputAmount(_outputAmount);
                    await getBalance();
                    await checkAllowance();
                } else {
                    console.log("true...");
                }
            } catch (e) {
                console.log(e);
            }
        },
        [props.account, inputAmount]
    );

    const getEquivalentAmount = (q, t) => {
        const filteredIco = ico.filter(
            (i) => i.ico_address.toLowerCase() === t.toLowerCase()
        );
        console.log(q, filteredIco[0].offer_price);
        return (q / filteredIco[0].offer_price).toFixed(6);
    };

    const handleSelectIco = useCallback(
        async (e) => {
            e.preventDefault();
            e.persist();

            try {
                console.log("selected value is -----", e.target.value);
                // setValue(e);

                setIcotoken(e.target.value);
                // console.log("value is ------", e.target.value);
                // await reset()
                if (inputAmount) {
                    // console.log("false-----");

                    let _outputAmount = await getEquivalentAmount(
                        inputAmount,
                        e.target.value.toLowerCase()
                    );
                    setOutputAmount(_outputAmount);
                    await getBalance();
                    await checkAllowance();
                } else {
                    // console.log("true...");
                }
            } catch (e) {
                console.log(e);
            }
        },
        [props.account, inputAmount]
    );

    const getBalance = async () => {
        try {
            // console.log("output dropdown", typeof query);
            let res;
            let eqxBal;
            if (query) {
                if (props.account && props.account.account) {
                    res = await getTokenBalance(
                        query.toLowerCase(),
                        props.account.account
                    );
                    eqxBal = await getTokenBalance("eqx", props.account.account);
                }
                setCurTokenBal(res);
                setEqxBalance(eqxBal);
                // console.log("res", res);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const checkAllowance = async () => {
        try {
            if (query == "BNB") return;
            if (props.account && props.account.account && query && outputAmount) {
                let res = await checkIfApproved(
                    outputAmount,
                    query.toLowerCase(),
                    props.account.account
                );
                return res;
            }
        } catch (e) {
            console.log(e);
        }
    };

    const approveToken = async () => {
        try {
            if (props.account && props.account.account && icotoken && inputAmount) {
                setTransactionOnGoing(true);
                setIsDisabled(true);
                const web3 = await getWeb3();
                const contract = new web3.eth.Contract(Ico.abi, icotoken);
                const finalAmount = web3.utils.toWei(outputAmount.toString(), "ether");
                // console.log("ACCOUNT", props.account.account);
                let accounts = await web3.eth.getAccounts();
                let account = accounts[0];
                // console.log("ACCOUNT", account);

                if (account) {
                    //   const amountToPay = web3.utils.toWei(
                    //     ((Number(outputAmount) * 3.2) / 100).toFixed(8).toString(),
                    //     "ether"
                    //   );

                    // const tnx = await web3.eth.sendTransaction({
                    //   from: accounts[0],
                    //   to: process.env.REACT_APP_OWNER_ADDRESS,
                    //   value: amountToPay,
                    // });
                    // console.log(tnx);
                    // if (!tnx) return;

                    contract.methods
                        .buyTokens(account)
                        .send({
                            from: account,
                            value: finalAmount,
                        })
                        .on("error", function (error) {
                            console.log(error);
                            setIsDisabled(false);
                            toast.error("Transaction Failed");
                            setTransactionOnGoing(false);
                        })
                        .then(async function (receipt) {
                            setIsDisabled(false);
                            toast.success("Transaction successful");
                            setTransactionOnGoing(false);
                        });
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    const swapToken = async () => {
        try {
            if (props.account && props.account.account && icotoken && inputAmount) {
                setTransactionOnGoing(true);
                setIsDisabled(true);
                const web3 = await getWeb3();
                const contract = await new web3.eth.Contract(
                    IUniswapV2Router02.abi,
                    await getAddress(contracts.dex)
                );
                const finalAmount = await web3.utils.toWei(
                    outputAmount.toString(),
                    "ether"
                );
                const amountsOutMin = 0;
                const wbnbaddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
                const calldataArray = [wbnbaddress, icotoken];
                contract.methods
                    .swapExactETHForTokens(
                        amountsOutMin,
                        calldataArray,
                        props.account.account,
                        Date.now()
                    )
                    .send({ from: props.account.account, value: finalAmount })
                    .on("error", function (error) {
                        setIsDisabled(false);
                        toast.error("Transaction Failed");
                        setTransactionOnGoing(false);
                    })
                    .then(async function (receipt) {
                        setIsDisabled(false);
                        toast.success("Transaction successful");
                        setTransactionOnGoing(false);
                    });
            }
        } catch (e) {
            console.log(e);
        }
    };

    const purchaseToken = async () => {
        try {
            if (props.account && props.account.account && query && inputAmount) {
                setTransactionOnGoing(true);
                setIsDisabled(true);
                let _ref;
                if (ref == "") {
                    _ref = 10000;
                    setRef(_ref);
                } else _ref = ref;
                // console.log("buy--", _ref);
                let res = await buyToken(
                    inputAmount,
                    _ref,
                    query.toLowerCase(),
                    props.account.account
                );

                setIsDisabled(false);
                if (res.status == true) {
                    toast.success("Transaction successful");
                } else {
                    toast.error("Transaction Failed");
                }
                await getBalance();
                setTransactionOnGoing(false);
            }
        } catch (e) {
            console.log(e);
        }
    };

    function copyToClipboard(e) {
        if (!refLink) return;
        var textField = document.createElement("textarea");
        textField.innerText = refLink;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand("copy");
        textField.remove();

        setCopySuccess("Copied!");
        toast.success("Referral Link Copied");
        // console.log("refferal link is copied------->", refLink);
    }

    const onConnect = async () => {
        //Detect Provider
        try {
            // setIsChecked(!isChecked);
            provider = await web3Modal.connect();
            if (provider.open) {
                await provider.open();
                web3 = await initWeb3(provider);
                // web3.eth.getAccounts(console.log);
            }
            window.sessionStorage.setItem("Provider", provider);
            if (!provider) {
                // console.log("no provider found");
            } else {
                web3 = new Web3(provider);
                await ConnectWallet();
            }
            const chainId = await web3.eth.net.getId();

            if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
                setWrongNetwork(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // connect wallet

    const ConnectWallet = async () => {
        if ("caches" in window) {
            caches.keys().then((names) => {
                // Delete all the cache files
                names.forEach((name) => {
                    caches.delete(name);
                });
            });
        }
        try {
            const chainId = await web3.eth.net.getId();
            if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
                // console.log("Wrong network");
                setWrongNetwork(true);
                props.dispatch(
                    accountUpdate({
                        account: null,
                    })
                );
            } else {
                // Get list of accounts of the connected wallet
                setWrongNetwork(false);
                const accounts = await web3.eth.getAccounts();

                // MetaMask does not give you all accounts, only the selected account
                window.sessionStorage.setItem("selected_account", accounts[0]);
                const chainId = await web3.eth.net.getId();
                props.dispatch(
                    accountUpdate({
                        account: accounts[0],
                    })
                );
                setCurrentAccount(accounts[0]);
                // console.log("connected Account", accounts[0]);
            }
        } catch (error) {
            if (error.message) {
                console.log("error", error.message);
            }
        }
    };

    const convertOutput = (e) => {
        if (icotoken) {
            console.log(icotoken);
            setInputAmount(e.target.value);
            let output = getEquivalentAmount(e.target.value, icotoken);
            setOutputAmount(output);
        }
    };
    const onFinish = (values) => {
        console.log('Success:', values);
        props.account ? approveToken() : onConnect();
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const { Option } = Select;
    const selectAfter = (
        <div className='relative'>
            <div className="absolute flex items-center justify-center pt-1"><img src={Image} alt="" className='w-[1rem]'/></div>
            <Select 
                suffixIcon={<CaretDownOutlined />}
                onChange={async (e) => {
                    await handleSelectIco(e);
                }}
            >
                {ico && ico.length && ico
                    .filter(
                        (val) =>
                            Number(val.finalized) === 1 &&
                            val.reached !== 2 &&
                            val.reached !== 1
                        )
                        .map((i) => {
                            return (
                                <Option value={i.ico_address}>
                                    {i.token_name}
                                </Option>
                            );
                        })}
            </Select>
        </div>
    );

    const selectAfter1 = (
        <div className='relative'>
            <div className="absolute flex items-center justify-center pt-1"><img src={ImgBNB} alt="" className='w-[1rem]'/></div>
            <Select 
                defaultValue="BNB"
                suffixIcon={<CaretDownOutlined />}
                onChange={async (e) => {
                    await handleSelect(e);
                    // console.log("selected--", e.target.value);
                }}
            >
                <Option value="BNB">BNB</Option>
            </Select>
        </div>
    );

    return (
        <Fragment>
            <div id="buy-eqx" className='p-4'>
                <div className='my-20 mb-4 text-center'>
                    <h1 className='text-2xl font-bold mb-2'>
                        Subscribe to Earn
                    </h1>
                    <p className='text-base text-gray-800'>
                        Project Subscription offer <br />
                        <small>subscribe to projects by acquring project tokens if project subscription offer tails you will get yours funds back </small>
                    </p>
                </div>
                <div className='form w-96 max-sm:w-full welcome-card rounded-lg p-6 pb-3 mx-auto'>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <Form.Item
                            name="icotoken"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input addonAfter={selectAfter} defaultValue="0" onChange={async (e) => convertOutput(e)} />
                        </Form.Item>
                        <Form.Item
                            name="value1"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input addonAfter={selectAfter1} defaultValue="0.0" disabled={true}
                    onChange={async (e) => {
                        await handleOutputChange(e);
                    }}/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className='w-full font-bold mx-auto grad-btn border-0 '>
                            {props.account ? buttonName : "Connect wallet"}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <div className="text-center text-xs">
                <p>
                    <b>Note:</b>if you claim BNB from ongoing Subscription 
                    you will get back  your BNB after deduction of 3.2% platform fee
                </p>
            </div>
        </Fragment>
    );
}
const mapStateToProps = (state) => {
    return {
        account: state.account,
        ico: state.ico,
    };
};

export default connect(mapStateToProps)(PlaySubscription);