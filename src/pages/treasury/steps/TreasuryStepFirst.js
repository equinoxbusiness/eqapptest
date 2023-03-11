import React, { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { addOrgFormData } from "../../../redux/actions";
import { connect } from "react-redux";

function TreasuryStepFirst(props) {
    const { nextStep } = props;
    const onFinish = async (values) => {
        console.log('Success:', values);
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addOrgFormData(values));
        nextStep();
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit success!');
    };
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [props.walletInfo?.wallet])

    return (
        <div className='mt-5 flex flex-col items-center justify-center'>
            <div className=' mb-12'>
                <h1 className='text-2xl font-bold mb-4'>
                    CREATE EQ Vault
                </h1>
                <p className='text-base text-gray-800'>
                    Read <a href="https://docs.equinox.business/">
                    <span className="text-[#0EA5E9] font-bold">Docs</span>
                  </a> for requirements.
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
                        wallet: props.walletInfo?.wallet,
                        eqxBln: props.walletInfo?.eqxBln,
                        deployer_name: "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Wallet"
                        name="wallet"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="EQ Balance"
                        name="eqxBln"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="Deployer's Full Name (You)"
                        name="deployer_name"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" className='ml-0 flex gap-1 mx-auto grad-btn border-0 '>
                        Next <svg xmlns="http://www.w3.org/2000/svg" className="self-center icon icon-tabler icon-tabler-arrow-narrow-right" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M5 12l14 0"></path>
                            <path d="M15 16l4 -4"></path>
                            <path d="M15 8l4 4"></path>
                        </svg>
                    </Button>
                </Form>
            </div>

        </div>
    );
}

export default connect()(TreasuryStepFirst);