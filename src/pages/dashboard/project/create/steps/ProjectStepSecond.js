import React, { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { addProjectFormData } from '../../../../../redux/actions';
import { connect } from "react-redux";

function ProjectStepSecond(props) {
    const {projectFormdata} = props;
    const { TextArea } = Input;
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
    return (
        <div>
            <div className=' mb-12 text-center'>
                <p>PROJECT LAUNCHER</p>
                <h1 className='text-2xl font-bold mb-4'>
                    STEP 2
                </h1>
                <p className='text-base'>
                    Description
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
                        project_description: projectFormdata?.project_description,
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Project's Description (Min 200 Words, Max 500 Words)"
                        name="project_description"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                message: 'Min 200 Words, Max 500 Words',
                                validator: (_, value, cb) => {
                                    if (value && value.length >= 200 && value.length <= 500) {
                                        cb()
                                    } else {
                                        cb('Min 200 Words, Max 500 Words')
                                    }
                                }
                            }
                        ]}
                    >
                        <TextArea rows={7} />
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
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        projectFormdata: state.projectFormdata
    };
  };
  
  export default connect(mapStateToProps)(ProjectStepSecond);