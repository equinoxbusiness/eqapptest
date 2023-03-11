import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { addProjectFormData } from '../../../../../redux/actions';
import { connect } from "react-redux";
import axios from 'axios';
import Spinner from '../../../../../components/Spinner/Spinner';

function ProjectStepThird(props) {
    const { projectFormdata } = props;
    const [spinner, setSpinner] = useState(false);
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addProjectFormData(values));
        props.nextStep();
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit Failed!');
    };
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [projectFormdata])
    const verifyFacebook = (_, value, cb) => {
      setSpinner(true);
      const formData = new FormData();
      formData.append("link", value);
      axios
        .post(`${process.env.REACT_APP_API_URL}/verify/facebook`, formData)
        .then((res) => {
          cb();
          setSpinner(false);
        })
        .catch((err) => {
          cb('not a valid link')
          setSpinner(false);
        });
    }
    return (
        <div>
            <div className=' mb-12 text-center'>
                <p>PROJECT LAUNCHER</p>
                <h1 className='text-2xl font-bold mb-4'>
                  STEP 3
                </h1>
                <p className='text-base'>
                  Social Channels
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
                      twitter: projectFormdata?.twitter,
                      facebook: projectFormdata?.facebook,
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Twitter"
                        name="twitter"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Facebook"
                        name="facebook"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                message: 'not a valid link',
                                validator: verifyFacebook
                            }
                        ]}
                    >
                        <Input />
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
            {spinner && <Spinner />}
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        projectFormdata: state.projectFormdata
    };
  };
  
  export default connect(mapStateToProps)(ProjectStepThird);