import { Breadcrumb, Button, message, theme } from 'antd';
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { getWeb3 } from "../../helpers/currentWalletHelper";
import bep20Abi from "../../Config/abis/bep20Abi.json";
import { getMe } from "../../services/dashboard";
import TreasuryStepFirst from './steps/TreasuryStepFirst';
import TreasuryStepSecond from './steps/TreasuryStepSecond';
import Spinner from "../../components/Spinner/Spinner";
import { useNavigate } from "react-router-dom";
import StepWizard from "react-step-wizard";
import TreasuryStepThird from './steps/TreasuryStepThird';
import TreasuryStepFour from './steps/TreasuryStepFour';

function Treasury(props) {
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [wallet, setWallet] = useState("");
    const [eqxBalance, setEqxBalance] = useState(0);
    let navigate = useNavigate();
    const { auth, spinner } = props;

    const getBalance = async () => {
        try {
            if (props.account && props.account.account) {
                let web3 = await getWeb3();
                let contract = await new web3.eth.Contract(
                    bep20Abi,
                    "0x54040960e09fb9f1dd533d4465505ba558693ad6"
                ); // this is test eqx address fetch this address from pages/Config/contracts.js
                const decimal = await contract.methods.decimals().call();
                await contract.methods
                    .balanceOf(props.account.account)
                    .call()
                    .then((balance) => {
                        balance = balance / 10 ** decimal;
                        setEqxBalance(balance);
                    });
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        if (props.account && props.account.account) {
            setWallet(props.account.account);
            getBalance();
        }
        const account = sessionStorage.getItem("selected_account");
        if (account) {
            getMe(account);
        }
    }, [props.account?.account]);
    useEffect(() => {
        if (auth?.id) {
          return navigate("/dashboard");
        }
      }, [auth?.id])
    return (
        <div className='main-sec'>
            <div className='container mx-auto p-4'>
                <StepWizard>
                    <TreasuryStepFirst walletInfo={{ wallet: wallet, eqxBln: eqxBalance }} />
                    <TreasuryStepSecond walletInfo={{ wallet: wallet, eqxBln: eqxBalance }} />
                    <TreasuryStepThird walletInfo={{ wallet: wallet, eqxBln: eqxBalance }} />
                    <TreasuryStepFour />
                </StepWizard>
            </div>
            {spinner && <Spinner />}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        account: state.account,
        auth: state.auth,
        spinner: state.spinner,
    };
};

export default connect(mapStateToProps)(Treasury);