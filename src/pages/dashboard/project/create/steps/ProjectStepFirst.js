import React, { useEffect } from 'react';
import { Button, Form, Input, message, Select } from 'antd';
import { addProjectFormData } from "../../../../../redux/actions";
import { connect } from "react-redux";
import { getCategory } from '../../../../../services/dashboard';

function ProjectStepFirst(props) {
    const { nextStep, projectFormdata } = props;
    useEffect(()=>{
        getCategory();
    },[])
    const onFinish = async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addProjectFormData(values));
        nextStep();
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit success!');
    };
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [projectFormdata])

    return (
        <div>
            <div className=' mb-12'>
                <p className='text-base text-gray-800 text-center'>
                    PROJECT LAUNCHER
                </p>
                <h2 className='font-bold  text-center'>CREATE PROJECT</h2>
                <p className='text-base text-gray-800'>
                    Projects are Business units with teams, governance token and Management plans. Governance tokens may be listed on Enterprise DEX for public trading or may solely be used for Organizational Governance..
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
                        project_name: projectFormdata?.project_name,
                        cat_id: projectFormdata?.cat_id,
                        project_site: projectFormdata?.project_site,
                        project_email: projectFormdata?.project_email
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Project Name"
                        name="project_name"
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
                        label="Category"
                        name="cat_id"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Select>
                            {(props.category ? props.category : []).map(item => (
                                <Select.Option key={item.id} value={item.id} label={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))} 
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Project's Website"
                        name="project_site"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                            {
                                pattern: /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                                message: 'Enter correct url!',
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Project's Email Address"
                        name="project_email"
                        rules={[
                            {
                                type: 'email',
                                message: 'Enter a valid email'
                            },
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
const mapStateToProps = (state) => {
    return {
      category: state.category,
      projectFormdata: state.projectFormdata
    };
};
  
export default connect(mapStateToProps)(ProjectStepFirst);
