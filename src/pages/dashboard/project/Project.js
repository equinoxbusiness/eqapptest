import { Breadcrumb, Button } from 'antd';
import axios from 'axios';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../../../components/Spinner/Spinner';
import { updateSpinner } from '../../../redux/actions';
import { getProjects } from '../../../services/dashboard';

function Project(props) {
    const { org, project = {}, auth, spinner } = props;
    const navigate = useNavigate();
    useEffect(() => {
        if (org && org.project && org.project.length && org.project[0].id) {
            getProjects(org.project[0].id);
        }
    }, [org, auth]);
    // useEffect(() => {
    //     props.dispatch(updateSpinner(true))
    // }, [])
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
              navigate("/dashboard/project/create");
            }
            // console.log(org?.project && org.project.length);
          }
        }
    };
    return (
        <div>
            <div className='mb-4 text-white'>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to='/dashboard/home'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className='font-bold text-pink-500'>Project</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            {org?.project && (org.project.length > 0) && <>
            <div className='mb-8'>
                <div className='text-base font-bold mb-3'>
                    {project.project_name}<br></br>
                    <span className='text-sm text-gray-400'>
                        {project.project_site}
                    </span>
                </div>
                <div className='mb-6 w-3/5 lg:width-full'>
                    {project.project_description}
                </div>
                <div className='flex gap-6'>
                    <a href={project.twitter} target="_blank">
                        <div className='flex gap-2 p-2 px-4 welcome-card rounded-lg'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-twitter" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c0 -.249 1.51 -2.772 1.818 -4.013z"></path>
                            </svg>
                            <span>
                                Twitter
                            </span>
                        </div>
                    </a>
                    <a href={project.facebook} target="_blank">
                        <div className='flex gap-2 p-2 px-4 welcome-card rounded-lg'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-facebook" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path>
                            </svg>
                            <span>
                                Facebook
                            </span>
                        </div>
                    </a>
                </div>
            </div>
            <div>
                <div className='p-6 welcome-card rounded-lg'>
                    <p className="font14 mb-1 text-truncate">
                      {project.deployer_wallet_address_id}
                    </p>
                    <h1 className='font-bold text-pink-500 text-xl mb-2'>
                        Total Supply
                    </h1>
                    <p className='mb-6 text-4xl font-bold'>
                        {project.fixed_supply}
                    </p>
                    <div className='flex flex-wrap gap-6'>
                        <div>
                            <Link to={"/dashboard/assets/createico"} className={
                            org?.ico &&
                            org.ico[org.ico.length - 1]?.reached === 0
                              ? "pointer-events-none"
                              : ""
                          }>
                                <Button type="primary" className='grad-btn border-0'>CREATE/MANAGE SUBSCRIPTION</Button>
                            </Link>
                        </div>
                        <div>
                            <Button type="primary" className='grad-btn border-0'>CREATE IDO</Button>
                        </div>
                        <div>
                            <Button type="primary" className='grad-btn border-0'>APPROVE/INITIATE REQUESTS</Button>
                        </div>
                    </div>
                </div>
            </div>
            </>}
            {!spinner && !(org?.project && org.project.length) && (<div className='p-6 welcome-card rounded-lg text-center'>
                <button className='rounded-lg font-bold px-6 py-3 grad-btn text-white' onClick={createProjectHandler}>LAUNCH PROJECT</button>
            </div>)}
            {spinner && <Spinner /> }
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
      org: state.org,
      project: state.project,
      auth: state.auth,
      spinner: state.spinner
    };
  };
  
  export default connect(mapStateToProps)(Project);