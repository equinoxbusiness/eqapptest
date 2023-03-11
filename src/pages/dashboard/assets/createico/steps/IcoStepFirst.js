import React, { useEffect } from 'react';
import { Button, Form, Input, message, Select } from 'antd';
import { connect } from "react-redux";
import { getOrg } from '../../../../../services/dashboard';
import { addIcoFormData } from '../../../../../redux/actions';

function IcoStepFirst(props) {
    const { org, auth } = props;

    useEffect(() => {
      if (auth && auth.org_id) getOrg(auth.org_id);
    }, [auth]);
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [org?.project])
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addIcoFormData(values));
        props.nextStep();
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
    };

    return (
        <div>
            <div className=' mb-12'>
                <h2 className='font-bold  text-center'>Create Project Subscription</h2>
                <p className='text-base text-gray-800'>
                    Subscription stands for Initial Coin Offering which allow DAO
                    to offer their Governance token holders to community at some
                    price in BNB value. The BNB collected will be credited to DAO
                    Treasury wallet and can be managed jointly by Team behind DAO
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
                        project: org && org.project && org.project.length && org.project[0].project_name ? org.project[0].project_name : "",
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Project"
                        name="project"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input disabled={true} />
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
const mapStateToProps = (state) => {
    return {
      org: state.org,
      auth: state.auth,
    };
};
  
export default connect(mapStateToProps)(IcoStepFirst);
