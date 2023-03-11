import React, { useEffect,useState } from 'react';
import { Button, Form, Input, message, Select } from 'antd';
import { addProposalFormData } from "../../../../../redux/actions";
import { connect } from "react-redux";
import { getCategory } from '../../../../../services/dashboard';
import axios from 'axios';

function ProposalStepFirst(props) {
    const { proposalFormdata, org } = props;
    const [cats, setCats] = useState([]);
    console.log(org);
    useEffect(()=>{
        getCategory();
    },[])
    const onFinish = async (values) => {
        console.log('ss     ')
        await new Promise((r) => setTimeout(r, 500));
        props.dispatch(addProposalFormData(values));
        props.nextStep();
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Submit success!');
    };
    const [form] = Form.useForm();
    useEffect(() => {
        form.resetFields();
    }, [org?.project])
    useEffect(() => {
        const getCat = async () => {
          try {
            const {
              data: { response },
            } = await axios.get(`${process.env.REACT_APP_API_URL}/get_category`);
            console.log(response);
            setCats(response);
          } catch (error) {
            console.log(error);
          }
        };
        getCat();
    }, []);

    return (
        <div className='mt-5 flex flex-col items-center justify-center'>
            <div className=' mb-12 text-center'>
                <h2 className='font-bold'>CREATE PROPOSAL</h2>
                <p className='text-base text-gray-800'>
                    Proposals are decisions taken by team and are open for vote in a time bound manner by G-Token holders of the Project.
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
                        project_name: org?.project && org?.project[0]?.project_name,
                        category_id: proposalFormdata?.category_id,
                        end_time_in_days: proposalFormdata?.end_time_in_days,
                    }}
                    form={form}
                >
                    <Form.Item
                        label="Project"
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
                        name="category_id"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            },
                        ]}
                    >
                        <Select>
                            {cats.map(item => (
                                <Select.Option key={item.id} value={item.id} label={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))} 
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Time required to complete in days"
                        name="end_time_in_days"
                        rules={[
                            {
                                required: true,
                                message: 'Required',
                            }
                        ]}
                    >
                        <Input type='number'/>
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
        category: state.category,
        proposalFormdata: state.proposalFormdata,
    };
};
  
export default connect(mapStateToProps)(ProposalStepFirst);
